/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Download, Grid, Layers, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { FabricConfig } from '../types/fabric';
import { isWarpUp, getYarnColors, adjustColorBrightness, generateFabricCanvasTexture } from '../utils/weaveGenerator';

interface MacroWeaveCanvasProps {
  config: FabricConfig;
  onUpdateConfig: (updater: (prev: FabricConfig) => FabricConfig) => void;
}

export const MacroWeaveCanvas: React.FC<MacroWeaveCanvasProps> = ({ config, onUpdateConfig }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 4 | 8>(4);
  const [mode, setMode] = useState<'simulation' | 'matrix'>('simulation');

  // Matrix grid size
  const matrixSize = 8;

  // Render high-res macro simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#14171d';
    ctx.fillRect(0, 0, width, height);

    // Number of threads visible depends on zoomLevel
    // At zoom 8: 12 threads; zoom 4: 24 threads; zoom 2: 48 threads; zoom 1: 96 threads
    const threadCount = Math.round(96 / zoomLevel);
    const cellSize = width / threadCount;

    // Draw background weft shadow
    ctx.fillStyle = config.weftColor;
    ctx.fillRect(0, 0, width, height);

    for (let r = 0; r < threadCount; r++) {
      const y = r * cellSize;
      for (let c = 0; c < threadCount; c++) {
        const x = c * cellSize;
        const warpUp = isWarpUp(config.weaveType, r, c, config.customMatrix);
        const { warp, weft } = getYarnColors(config, r, c);

        // Organic slub irregularity
        let slub = 0;
        if (config.slubIntensity > 0) {
          const hash = Math.sin(r * 37.1 + c * 91.7) * 23421.123;
          slub = (hash - Math.floor(hash) - 0.5) * config.slubIntensity * 32;
        }

        if (warpUp) {
          // Vertical warp thread with cylindrical shading
          const grad = ctx.createLinearGradient(x, y, x + cellSize, y);
          grad.addColorStop(0, adjustColorBrightness(warp, -28 + slub));
          grad.addColorStop(0.2, adjustColorBrightness(warp, -8 + slub));
          grad.addColorStop(0.5, adjustColorBrightness(warp, 18 + slub));
          grad.addColorStop(0.8, adjustColorBrightness(warp, -8 + slub));
          grad.addColorStop(1, adjustColorBrightness(warp, -28 + slub));

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, cellSize, cellSize);

          // Deep cast shadow at thread crossover boundary
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(x, y, cellSize, Math.max(1, cellSize * 0.12));
          ctx.fillRect(x, y + cellSize - Math.max(1, cellSize * 0.12), cellSize, Math.max(1, cellSize * 0.12));

          // Draw fine fiber striations if zoomed in
          if (zoomLevel >= 4) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(x + cellSize * 0.35, y, 1, cellSize);
            ctx.fillRect(x + cellSize * 0.6, y, 1, cellSize);
          }
        } else {
          // Horizontal weft thread with cylindrical shading
          const grad = ctx.createLinearGradient(x, y, x, y + cellSize);
          grad.addColorStop(0, adjustColorBrightness(weft, -28 + slub));
          grad.addColorStop(0.2, adjustColorBrightness(weft, -8 + slub));
          grad.addColorStop(0.5, adjustColorBrightness(weft, 18 + slub));
          grad.addColorStop(0.8, adjustColorBrightness(weft, -8 + slub));
          grad.addColorStop(1, adjustColorBrightness(weft, -28 + slub));

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, cellSize, cellSize);

          // Deep cast shadow at thread crossover boundary
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(x, y, Math.max(1, cellSize * 0.12), cellSize);
          ctx.fillRect(x + cellSize - Math.max(1, cellSize * 0.12), y, Math.max(1, cellSize * 0.12), cellSize);

          if (zoomLevel >= 4) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(x, y + cellSize * 0.35, cellSize, 1);
            ctx.fillRect(x, y + cellSize * 0.6, cellSize, 1);
          }
        }
      }
    }

    // Fiber sheen overlay
    if (config.fiberSheen === 'silk_luster' || config.fiberSheen === 'satin_gloss') {
      const shineGrad = ctx.createLinearGradient(0, 0, width, height);
      shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.14)');
      shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
      ctx.fillStyle = shineGrad;
      ctx.fillRect(0, 0, width, height);
    }
  }, [config, zoomLevel]);

  // Handle matrix cell toggle in Drawdown Matrix Mode
  const toggleMatrixCell = (r: number, c: number) => {
    onUpdateConfig((prev) => {
      // Ensure customMatrix exists
      let matrix = prev.customMatrix;
      if (!matrix || matrix.length !== matrixSize) {
        matrix = Array.from({ length: matrixSize }, (_, rowIdx) =>
          Array.from({ length: matrixSize }, (_, colIdx) =>
            isWarpUp(prev.weaveType, rowIdx, colIdx)
          )
        );
      } else {
        // Deep copy
        matrix = matrix.map((row) => [...row]);
      }

      matrix[r][c] = !matrix[r][c];

      return {
        ...prev,
        weaveType: 'custom',
        customMatrix: matrix,
      };
    });
  };

  const handleClearMatrix = (fillWarp: boolean) => {
    const newMatrix = Array.from({ length: matrixSize }, () =>
      Array.from({ length: matrixSize }, () => fillWarp)
    );
    onUpdateConfig((prev) => ({
      ...prev,
      weaveType: 'custom',
      customMatrix: newMatrix,
    }));
  };

  const handleInvertMatrix = () => {
    onUpdateConfig((prev) => {
      const matrix = prev.customMatrix || Array.from({ length: matrixSize }, (_, r) =>
        Array.from({ length: matrixSize }, (_, c) => isWarpUp(prev.weaveType, r, c))
      );
      const inverted = matrix.map((row) => row.map((val) => !val));
      return {
        ...prev,
        weaveType: 'custom',
        customMatrix: inverted,
      };
    });
  };

  const handleDownloadSeamlessTile = () => {
    const tile = generateFabricCanvasTexture(config, 1024);
    const link = document.createElement('a');
    link.href = tile.toDataURL('image/png');
    link.download = `seamless-fabric-${config.weaveType}.png`;
    link.click();
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#121418] rounded-xl overflow-hidden border border-white/5 flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#171a21] border-b border-white/5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#c29b62]" />
          <span className="text-xs font-semibold text-white tracking-wide">Macro Thread Simulation</span>
          <span className="text-xs text-white/40">·</span>
          <span className="text-xs font-mono text-white/60 capitalize">
            {config.weaveType.replace('_', ' ')}
          </span>
        </div>

        {/* View Mode Toggle: Realistic Thread Canvas vs Technical Drawdown Matrix */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
          <button
            onClick={() => setMode('simulation')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              mode === 'simulation'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Tactile Weave
          </button>
          <button
            onClick={() => setMode('matrix')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              mode === 'matrix'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Drawdown Draft
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex items-center justify-center p-4 bg-[#0e1013] overflow-hidden">
        {mode === 'simulation' ? (
          <div className="relative w-full h-full max-w-[540px] max-h-[540px] aspect-square flex items-center justify-center">
            {/* Warp & Weft Direction Indicators */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] text-white/40 font-mono">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.warpColor }} />
              <span>Warp Ends (Vertical)</span>
            </div>

            <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 flex items-center gap-1 text-[10px] text-white/40 font-mono">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.weftColor }} />
              <span>Weft Picks (Horizontal)</span>
            </div>

            <canvas
              ref={canvasRef}
              width={640}
              height={640}
              className="w-full h-full rounded-lg shadow-2xl border border-white/10 object-contain"
            />
          </div>
        ) : (
          /* Technical Loom Drawdown Matrix Editor */
          <div className="flex flex-col items-center gap-4">
            <div className="text-center max-w-sm">
              <h4 className="text-xs font-semibold text-white tracking-wide flex items-center justify-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-[#c29b62]" />
                8×8 Loom Harness Drawdown Matrix
              </h4>
              <p className="text-[11px] text-white/50 mt-1">
                Click cells to toggle warp/weft crossovers. Black cells indicate warp floating over weft.
              </p>
            </div>

            <div className="p-3 bg-[#171a21] rounded-xl border border-white/10 shadow-xl">
              <div className="grid grid-cols-8 gap-1 w-64 h-64">
                {Array.from({ length: matrixSize }).map((_, r) =>
                  Array.from({ length: matrixSize }).map((__, c) => {
                    const warpUp = isWarpUp(config.weaveType, r, c, config.customMatrix);
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => toggleMatrixCell(r, c)}
                        className={`w-full h-full rounded transition-all duration-100 border ${
                          warpUp
                            ? 'bg-[#c29b62] border-[#e2ba7d] shadow-sm'
                            : 'bg-[#1b1f28] border-white/10 hover:border-white/30'
                        }`}
                        title={`Row ${r + 1}, Col ${c + 1}: ${warpUp ? 'Warp Up' : 'Weft Up'}`}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Matrix Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleInvertMatrix}
                className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/80 rounded-lg border border-white/10 transition-colors"
              >
                Invert Draft
              </button>
              <button
                onClick={() => handleClearMatrix(true)}
                className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/80 rounded-lg border border-white/10 transition-colors"
              >
                All Warp
              </button>
              <button
                onClick={() => handleClearMatrix(false)}
                className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/80 rounded-lg border border-white/10 transition-colors"
              >
                All Weft
              </button>
            </div>
          </div>
        )}

        {/* Floating Zoom & Export HUD when in simulation mode */}
        {mode === 'simulation' && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
            <div className="flex items-center gap-0.5 px-1 text-xs text-white/70">
              <span className="font-mono">{zoomLevel}×</span>
            </div>

            <button
              onClick={() => setZoomLevel((prev) => (prev > 1 ? ((prev / 2) as any) : 1))}
              disabled={zoomLevel === 1}
              className="p-1.5 rounded text-white/70 hover:text-white disabled:opacity-30 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setZoomLevel((prev) => (prev < 8 ? ((prev * 2) as any) : 8))}
              disabled={zoomLevel === 8}
              className="p-1.5 rounded text-white/70 hover:text-white disabled:opacity-30 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

            <button
              onClick={handleDownloadSeamlessTile}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-[#c29b62]/20 hover:bg-[#c29b62]/30 text-[#e8c691] rounded border border-[#c29b62]/40 transition-colors"
              title="Download 1024px Seamless Fabric Tile"
            >
              <Download className="w-3 h-3" />
              <span>Tile PNG</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Spec strip */}
      <div className="px-4 py-2 bg-[#171a21] border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
        <div className="flex items-center gap-2">
          <span>Yarn Twist: {config.twistDirection}</span>
          <span>·</span>
          <span>Slub Density: {Math.round(config.slubIntensity * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Finish: {config.fiberSheen.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  );
};
