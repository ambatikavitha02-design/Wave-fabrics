/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ARTISANAL_PALETTES, FabricConfig, FiberSheen, WeaveType } from '../types/fabric';

interface WeaveControlsProps {
  config: FabricConfig;
  onChange: (updater: (prev: FabricConfig) => FabricConfig) => void;
}

const WEAVE_OPTIONS: { id: WeaveType; label: string; desc: string }[] = [
  { id: 'plain', label: 'Plain (Tabby)', desc: '1×1 balanced grid structure' },
  { id: 'twill_2_2', label: '2/2 Twill', desc: 'Distinct diagonal rib; denim & chino' },
  { id: 'twill_herringbone', label: 'Herringbone', desc: 'Broken chevron twill pattern' },
  { id: 'houndstooth', label: 'Houndstooth', desc: 'Color-and-weave interlocking check' },
  { id: 'satin_5', label: '5-End Satin', desc: 'Long thread floats; lustrous drape' },
  { id: 'waffle', label: 'Waffle Honeycomb', desc: '3D thermal moisture-wicking cells' },
  { id: 'oxford', label: 'Oxford Basket', desc: '2×2 paired yarns; textured shirting' },
  { id: 'custom', label: 'Custom Draft', desc: 'Loom harness interactive matrix' },
];

const SHEEN_OPTIONS: { id: FiberSheen; label: string }[] = [
  { id: 'matte_cotton', label: 'Matte Cotton' },
  { id: 'raw_linen', label: 'Crisp Linen' },
  { id: 'silk_luster', label: 'Mulberry Silk' },
  { id: 'wool_tweed', label: 'Wool Tweed' },
  { id: 'satin_gloss', label: 'High Gloss' },
];

export const WeaveControls: React.FC<WeaveControlsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      {/* 1. Weave Structure Selection */}
      <div>
        <label className="text-xs font-semibold text-white/90 uppercase tracking-wider block mb-2.5">
          Weave Architecture
        </label>
        <div className="grid grid-cols-2 gap-2">
          {WEAVE_OPTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  weaveType: item.id,
                }))
              }
              className={`text-left p-2.5 rounded-lg border transition-all ${
                config.weaveType === item.id
                  ? 'bg-[#c29b62]/15 border-[#c29b62] text-white shadow-sm'
                  : 'bg-[#181a20] border-white/5 text-white/70 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="text-xs font-medium">{item.label}</div>
              <div className="text-[11px] text-white/40 truncate mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Warp & Weft Yarn Dyes */}
      <div className="grid grid-cols-2 gap-4">
        {/* Warp Dye */}
        <div className="bg-[#181a20] p-3 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/90">Warp Yarn (Vertical)</span>
            <span className="font-mono text-[11px] text-white/50 uppercase">{config.warpColor}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.warpColor}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  warpColor: e.target.value,
                }))
              }
              className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0"
              title="Pick Warp Color"
            />
            <div className="text-[11px] text-white/50 truncate">Longitudinal foundation</div>
          </div>

          {/* Quick Swatches */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
            {ARTISANAL_PALETTES.slice(0, 8).map((p) => (
              <button
                key={p.name}
                onClick={() => onChange((prev) => ({ ...prev, warpColor: p.hex }))}
                className="w-4 h-4 rounded-full border border-white/20 shrink-0 hover:scale-110 transition-transform"
                style={{ backgroundColor: p.hex }}
                title={`Warp: ${p.name}`}
              />
            ))}
          </div>
        </div>

        {/* Weft Dye */}
        <div className="bg-[#181a20] p-3 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/90">Weft Yarn (Horizontal)</span>
            <span className="font-mono text-[11px] text-white/50 uppercase">{config.weftColor}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.weftColor}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  weftColor: e.target.value,
                }))
              }
              className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0"
              title="Pick Weft Color"
            />
            <div className="text-[11px] text-white/50 truncate">Crosswise shuttle thread</div>
          </div>

          {/* Quick Swatches */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
            {ARTISANAL_PALETTES.slice(8, 16).map((p) => (
              <button
                key={p.name}
                onClick={() => onChange((prev) => ({ ...prev, weftColor: p.hex }))}
                className="w-4 h-4 rounded-full border border-white/20 shrink-0 hover:scale-110 transition-transform"
                style={{ backgroundColor: p.hex }}
                title={`Weft: ${p.name}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Physical Yarn Properties */}
      <div className="space-y-4 bg-[#181a20] p-3.5 rounded-xl border border-white/5">
        {/* Yarn Gauge */}
        <div>
          <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
            <span>Thread Weight (Gauge)</span>
            <span className="font-mono text-white/50 text-[11px]">
              {config.yarnGauge <= 1.5
                ? 'Fine 80/2 Ne'
                : config.yarnGauge <= 3
                ? 'Standard 40/1 Ne'
                : 'Coarse 12/1 Ne'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={config.yarnGauge}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, yarnGauge: parseFloat(e.target.value) }))
            }
            className="w-full accent-[#c29b62] h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>

        {/* Slub / Nep Organic Irregularity */}
        <div>
          <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
            <span>Organic Slub & Nep Irregularity</span>
            <span className="font-mono text-white/50 text-[11px]">
              {Math.round(config.slubIntensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.slubIntensity}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, slubIntensity: parseFloat(e.target.value) }))
            }
            className="w-full accent-[#c29b62] h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>

        {/* Thread Density (EPI & PPI) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex items-center justify-between text-[11px] text-white/70 mb-1">
              <span>Warp EPI</span>
              <span className="font-mono">{config.threadDensityWarp}</span>
            </div>
            <input
              type="range"
              min={30}
              max={120}
              step={5}
              value={config.threadDensityWarp}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, threadDensityWarp: parseInt(e.target.value) }))
              }
              className="w-full accent-[#c29b62] h-1.5 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-white/70 mb-1">
              <span>Weft PPI</span>
              <span className="font-mono">{config.threadDensityWeft}</span>
            </div>
            <input
              type="range"
              min={30}
              max={120}
              step={5}
              value={config.threadDensityWeft}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, threadDensityWeft: parseInt(e.target.value) }))
              }
              className="w-full accent-[#c29b62] h-1.5 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Fiber Finish & Twist */}
      <div>
        <label className="text-xs font-semibold text-white/90 uppercase tracking-wider block mb-2.5">
          Fiber Sheen & Tactile Finish
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SHEEN_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange((prev) => ({ ...prev, fiberSheen: opt.id }))}
              className={`px-2.5 py-2 rounded-lg border text-xs text-center transition-all ${
                config.fiberSheen === opt.id
                  ? 'bg-white/15 border-white/40 text-white font-medium shadow-sm'
                  : 'bg-[#181a20] border-white/5 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
