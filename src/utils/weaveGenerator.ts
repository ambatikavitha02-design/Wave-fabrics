/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FabricConfig, WeaveType } from '../types/fabric';

/**
 * Returns whether warp thread is UP (over weft) at grid coordinate (r, c).
 * r = pick (weft row, y-axis)
 * c = end (warp column, x-axis)
 */
export function isWarpUp(
  weaveType: WeaveType,
  r: number,
  c: number,
  customMatrix?: boolean[][]
): boolean {
  switch (weaveType) {
    case 'plain':
      return (r + c) % 2 === 0;

    case 'twill_2_2':
      return ((r + c) % 4) < 2;

    case 'twill_herringbone': {
      // 8-column repeat with chevron flip
      const cycle = 8;
      const modC = ((c % cycle) + cycle) % cycle;
      const effectiveC = modC < 4 ? modC : (7 - modC);
      return ((r + effectiveC) % 4) < 2;
    }

    case 'houndstooth':
      // 2/2 twill base with 4x4 color-and-weave
      return ((r + c) % 4) < 2;

    case 'satin_5': {
      // 5-end satin: step of 2 or 3
      return ((r * 2 + c) % 5) === 0;
    }

    case 'waffle': {
      // 8x8 diamond waffle weave float pattern
      const mr = ((r % 8) + 8) % 8;
      const mc = ((c % 8) + 8) % 8;
      // Diamond center float
      const dist = Math.abs(mr - 3.5) + Math.abs(mc - 3.5);
      return dist <= 2.5;
    }

    case 'oxford': {
      // 2x2 basket weave
      const br = Math.floor(r / 2);
      const bc = Math.floor(c / 2);
      return (br + bc) % 2 === 0;
    }

    case 'custom':
      if (customMatrix && customMatrix.length > 0) {
        const rows = customMatrix.length;
        const cols = customMatrix[0].length;
        const mr = ((r % rows) + rows) % rows;
        const mc = ((c % cols) + cols) % cols;
        return !!customMatrix[mr][mc];
      }
      return (r + c) % 2 === 0;

    default:
      return (r + c) % 2 === 0;
  }
}

/**
 * Returns color of yarn at coordinate, taking into account Houndstooth yarn sequence
 */
export function getYarnColors(
  config: FabricConfig,
  r: number,
  c: number
): { warp: string; weft: string } {
  if (config.weaveType === 'houndstooth') {
    // 4 ends dark, 4 ends light
    const isWarpDark = ((c % 8) + 8) % 8 < 4;
    const isWeftDark = ((r % 8) + 8) % 8 < 4;
    return {
      warp: isWarpDark ? config.warpColor : config.weftColor,
      weft: isWeftDark ? config.warpColor : config.weftColor,
    };
  }

  return {
    warp: config.warpColor,
    weft: config.weftColor,
  };
}

/**
 * Helper to adjust hex color lightness/darkness
 */
export function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(255 * (percent / 100))));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100))));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + Math.round(255 * (percent / 100))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Generate seamless tile texture canvas for 3D garment viewport
 */
export function generateFabricCanvasTexture(
  config: FabricConfig,
  size = 512
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Fill base background
  ctx.fillStyle = config.weftColor;
  ctx.fillRect(0, 0, size, size);

  // Number of thread cells in tile based on yarnGauge
  // Gauge 1 (fine) = 64 cells, Gauge 5 (coarse) = 16 cells
  const threadCount = Math.round(64 / Math.max(1, config.yarnGauge * 0.7));
  const cellSize = size / threadCount;

  // Render woven yarn threads
  for (let r = 0; r < threadCount; r++) {
    const y = r * cellSize;
    for (let c = 0; c < threadCount; c++) {
      const x = c * cellSize;
      const warpIsUp = isWarpUp(config.weaveType, r, c, config.customMatrix);
      const { warp, weft } = getYarnColors(config, r, c);

      // Add pseudo-random organic slub variation
      let slubVar = 0;
      if (config.slubIntensity > 0) {
        // Deterministic pseudo-random hash from coord
        const hash = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
        const norm = (hash - Math.floor(hash));
        slubVar = (norm - 0.5) * config.slubIntensity * 28;
      }

      if (warpIsUp) {
        // Vertical warp thread visible
        const baseColor = warp;
        const grad = ctx.createLinearGradient(x, y, x + cellSize, y);
        grad.addColorStop(0, adjustColorBrightness(baseColor, -20 + slubVar));
        grad.addColorStop(0.5, adjustColorBrightness(baseColor, 12 + slubVar));
        grad.addColorStop(1, adjustColorBrightness(baseColor, -20 + slubVar));

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Subtle shadow underneath weft boundary
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.fillRect(x, y, cellSize, 1);
        ctx.fillRect(x, y + cellSize - 1, cellSize, 1);
      } else {
        // Horizontal weft thread visible
        const baseColor = weft;
        const grad = ctx.createLinearGradient(x, y, x, y + cellSize);
        grad.addColorStop(0, adjustColorBrightness(baseColor, -20 + slubVar));
        grad.addColorStop(0.5, adjustColorBrightness(baseColor, 12 + slubVar));
        grad.addColorStop(1, adjustColorBrightness(baseColor, -20 + slubVar));

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Subtle shadow underneath warp boundary
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.fillRect(x, y, 1, cellSize);
        ctx.fillRect(x + cellSize - 1, y, 1, cellSize);
      }
    }
  }

  // Fiber Sheen Highlights (e.g. Silk luster / Satin sheen / Linen fiber hair)
  if (config.fiberSheen === 'silk_luster' || config.fiberSheen === 'satin_gloss') {
    const shine = ctx.createLinearGradient(0, 0, size, size);
    shine.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    shine.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
    shine.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, size, size);
  } else if (config.fiberSheen === 'wool_tweed') {
    // Add micro fiber fuzz noise
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < 600; i++) {
      const rx = (Math.sin(i * 91.1) * 0.5 + 0.5) * size;
      const ry = (Math.cos(i * 47.3) * 0.5 + 0.5) * size;
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }
  }

  // Draw Print Layer on top if selected
  if (config.printMotif !== 'none' && config.printOpacity > 0) {
    drawPrintLayer(ctx, config, size);
  }

  return canvas;
}

/**
 * Generate Bump / Height Map for realistic tactile 3D relief
 */
export function generateFabricBumpTexture(
  config: FabricConfig,
  size = 512
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const threadCount = Math.round(64 / Math.max(1, config.yarnGauge * 0.7));
  const cellSize = size / threadCount;

  for (let r = 0; r < threadCount; r++) {
    const y = r * cellSize;
    for (let c = 0; c < threadCount; c++) {
      const x = c * cellSize;
      const warpIsUp = isWarpUp(config.weaveType, r, c, config.customMatrix);

      if (warpIsUp) {
        const grad = ctx.createLinearGradient(x, y, x + cellSize, y);
        grad.addColorStop(0, '#555555');
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(1, '#555555');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, cellSize, cellSize);
      } else {
        const grad = ctx.createLinearGradient(x, y, x, y + cellSize);
        grad.addColorStop(0, '#555555');
        grad.addColorStop(0.5, '#d0d0d0');
        grad.addColorStop(1, '#555555');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }

  return canvas;
}

/**
 * Procedural Print Layer Drawing (Florals, Bauhaus, Stripes, Tartan, Shibori, etc.)
 */
function drawPrintLayer(
  ctx: CanvasRenderingContext2D,
  config: FabricConfig,
  size: number
) {
  ctx.save();
  ctx.globalAlpha = config.printOpacity;
  const compositeOp: GlobalCompositeOperation =
    config.printBlendMode === 'normal' ? 'source-over' : config.printBlendMode;
  ctx.globalCompositeOperation = compositeOp;

  const scale = config.printScale;
  const color1 = config.printColor1;
  const color2 = config.printColor2;

  switch (config.printMotif) {
    case 'bengal_stripe': {
      const stripeWidth = Math.max(8, 24 * scale);
      ctx.translate(size / 2, size / 2);
      ctx.rotate((config.printRotation * Math.PI) / 180);
      ctx.translate(-size, -size);

      for (let x = -size; x < size * 3; x += stripeWidth * 2) {
        ctx.fillStyle = color1;
        ctx.fillRect(x, -size, stripeWidth, size * 4);
        ctx.fillStyle = color2;
        ctx.fillRect(x + stripeWidth, -size, stripeWidth, size * 4);
      }
      break;
    }

    case 'tartan_grid': {
      const step = Math.max(20, 60 * scale);
      ctx.translate(size / 2, size / 2);
      ctx.rotate((config.printRotation * Math.PI) / 180);
      ctx.translate(-size, -size);

      // Vertical bands
      for (let x = -size; x < size * 3; x += step) {
        ctx.fillStyle = color1;
        ctx.fillRect(x, -size, step * 0.4, size * 4);
        ctx.fillStyle = color2;
        ctx.fillRect(x + step * 0.6, -size, step * 0.1, size * 4);
      }
      // Horizontal bands
      for (let y = -size; y < size * 3; y += step) {
        ctx.fillStyle = color1;
        ctx.fillRect(-size, y, size * 4, step * 0.4);
        ctx.fillStyle = color2;
        ctx.fillRect(-size, y + step * 0.6, size * 4, step * 0.1);
      }
      break;
    }

    case 'micro_polka': {
      const dotSpacing = Math.max(12, 32 * scale);
      const radius = dotSpacing * 0.18;
      ctx.fillStyle = color1;
      for (let y = 0; y < size; y += dotSpacing) {
        const offset = (Math.floor(y / dotSpacing) % 2) * (dotSpacing / 2);
        for (let x = -offset; x < size + dotSpacing; x += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'botanical_leaves': {
      // Elegant minimal botanical leaf branch motif
      const branchDist = Math.max(60, 140 * scale);
      ctx.translate(size / 2, size / 2);
      ctx.rotate((config.printRotation * Math.PI) / 180);
      ctx.translate(-size, -size);

      for (let py = -size; py < size * 3; py += branchDist) {
        for (let px = -size; px < size * 3; px += branchDist) {
          ctx.save();
          ctx.translate(px, py);

          // Draw stem
          ctx.strokeStyle = color1;
          ctx.lineWidth = Math.max(2, 4 * scale);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(20 * scale, 30 * scale, 40 * scale, 80 * scale);
          ctx.stroke();

          // Draw leaves
          ctx.fillStyle = color2;
          for (let i = 0; i < 4; i++) {
            const ly = i * 20 * scale + 10;
            const side = i % 2 === 0 ? 1 : -1;
            ctx.save();
            ctx.translate(side * 12 * scale, ly);
            ctx.rotate((side * 35 * Math.PI) / 180);
            ctx.beginPath();
            ctx.ellipse(0, 0, 14 * scale, 7 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.restore();
        }
      }
      break;
    }

    case 'bauhaus_geometry': {
      const unit = Math.max(40, 100 * scale);
      for (let y = 0; y < size; y += unit) {
        for (let x = 0; x < size; x += unit) {
          const mode = (Math.floor(x / unit) + Math.floor(y / unit)) % 3;
          if (mode === 0) {
            ctx.fillStyle = color1;
            ctx.beginPath();
            ctx.arc(x + unit / 2, y + unit / 2, unit * 0.4, 0, Math.PI);
            ctx.fill();
          } else if (mode === 1) {
            ctx.fillStyle = color2;
            ctx.beginPath();
            ctx.moveTo(x, y + unit);
            ctx.lineTo(x + unit, y + unit);
            ctx.lineTo(x + unit / 2, y);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillStyle = color1;
            ctx.fillRect(x + unit * 0.15, y + unit * 0.15, unit * 0.7, unit * 0.7);
          }
        }
      }
      break;
    }

    case 'shibori_indigo': {
      // Organic tie-dye dye rings
      const ringDist = Math.max(50, 120 * scale);
      for (let y = 0; y < size; y += ringDist) {
        for (let x = 0; x < size; x += ringDist) {
          const grad = ctx.createRadialGradient(x, y, 5 * scale, x, y, 45 * scale);
          grad.addColorStop(0, color1);
          grad.addColorStop(0.4, 'transparent');
          grad.addColorStop(0.7, color2);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(x - 50 * scale, y - 50 * scale, 100 * scale, 100 * scale);
        }
      }
      break;
    }

    case 'terrazzo_fleck': {
      // Natural speckled neps and flecks
      const count = Math.round(180 * scale);
      ctx.fillStyle = color1;
      for (let i = 0; i < count; i++) {
        const x = (Math.sin(i * 19.3) * 0.5 + 0.5) * size;
        const y = (Math.cos(i * 29.7) * 0.5 + 0.5) * size;
        const r = ((i % 5) + 1.5) * scale;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = color2;
      for (let i = 0; i < count * 0.6; i++) {
        const x = (Math.cos(i * 37.1) * 0.5 + 0.5) * size;
        const y = (Math.sin(i * 43.9) * 0.5 + 0.5) * size;
        const r = ((i % 3) + 2) * scale;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

/**
 * Calculate realistic textile metrics
 */
export function calculateTextileMetrics(config: FabricConfig) {
  // Yarn count Ne estimation from yarnGauge (1 = 80s fine cotton, 5 = 10s heavy wool)
  const yarnCountNe = Math.round(90 / (config.yarnGauge * 1.6));
  const epi = config.threadDensityWarp;
  const ppi = config.threadDensityWeft;
  const threadCountTotal = epi + ppi;

  // Approximate fabric GSM = (EPI + PPI) * 23.25 / Ne (with crimp factor ~ 1.05)
  const gsm = Math.round(((epi + ppi) * 25.4) / yarnCountNe);
  const ozSqYd = Number((gsm * 0.0294935).toFixed(1));

  let category = 'Lightweight Shirting & Voile';
  if (gsm >= 340) {
    category = 'Heavy Suiting, Outerwear & Upholstery';
  } else if (gsm >= 220) {
    category = 'Medium-Weight Tailoring, Chino & Linen';
  } else if (gsm >= 140) {
    category = 'Standard Shirting, Dress & Blouse';
  }

  return {
    yarnCountNe: `${yarnCountNe}/1 Ne`,
    epi: `${epi} ends/inch`,
    ppi: `${ppi} picks/inch`,
    threadCount: `${threadCountTotal} TC`,
    gsm: `${gsm} g/m²`,
    ozSqYd: `${ozSqYd} oz/yd²`,
    category,
  };
}
