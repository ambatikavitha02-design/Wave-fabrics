/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ARTISANAL_PALETTES, FabricConfig, PrintMotif } from '../types/fabric';

interface PrintControlsProps {
  config: FabricConfig;
  onChange: (updater: (prev: FabricConfig) => FabricConfig) => void;
}

const PRINT_MOTIFS: { id: PrintMotif; label: string; desc: string }[] = [
  { id: 'none', label: 'Solid Weave', desc: 'No surface print overlay' },
  { id: 'botanical_leaves', label: 'Botanical Leaves', desc: 'Curated flora branch repeat' },
  { id: 'bauhaus_geometry', label: 'Bauhaus Arch', desc: 'Geometric modernism shapes' },
  { id: 'bengal_stripe', label: 'Bengal Stripe', desc: 'Classic shirting vertical bands' },
  { id: 'tartan_grid', label: 'Tartan Check', desc: 'Highland grid crossed bands' },
  { id: 'shibori_indigo', label: 'Shibori Tie-Dye', desc: 'Japanese resist dye rings' },
  { id: 'terrazzo_fleck', label: 'Terrazzo Fleck', desc: 'Speckled mineral slub confetti' },
  { id: 'micro_polka', label: 'Micro Polka', desc: 'Balanced rhythmic pin-dots' },
];

const BLEND_MODES: { id: FabricConfig['printBlendMode']; label: string; desc: string }[] = [
  { id: 'multiply', label: 'Vat Dye (Multiply)', desc: 'Soaks into yarn fibers' },
  { id: 'overlay', label: 'Screen Print (Overlay)', desc: 'Textured ink pigment' },
  { id: 'screen', label: 'Discharge Bleach', desc: 'Pigment removal highlight' },
  { id: 'normal', label: 'Direct Opaque', desc: 'Full coverage surface ink' },
];

export const PrintControls: React.FC<PrintControlsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      {/* 1. Motif Selection */}
      <div>
        <label className="text-xs font-semibold text-white/90 uppercase tracking-wider block mb-2.5">
          Surface Print & Pattern Layer
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRINT_MOTIFS.map((motif) => (
            <button
              key={motif.id}
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  printMotif: motif.id,
                  printOpacity: motif.id === 'none' ? 0 : prev.printOpacity > 0 ? prev.printOpacity : 0.85,
                }))
              }
              className={`text-left p-2.5 rounded-lg border transition-all ${
                config.printMotif === motif.id
                  ? 'bg-[#c29b62]/15 border-[#c29b62] text-white shadow-sm'
                  : 'bg-[#181a20] border-white/5 text-white/70 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="text-xs font-medium">{motif.label}</div>
              <div className="text-[11px] text-white/40 truncate mt-0.5">{motif.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {config.printMotif !== 'none' && (
        <>
          {/* 2. Print Colors */}
          <div className="grid grid-cols-2 gap-4">
            {/* Color 1 */}
            <div className="bg-[#181a20] p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/90">Primary Dye Ink</span>
                <span className="font-mono text-[11px] text-white/50 uppercase">
                  {config.printColor1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.printColor1}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, printColor1: e.target.value }))
                  }
                  className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0"
                />
                <span className="text-[11px] text-white/50">Base print motif</span>
              </div>

              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                {ARTISANAL_PALETTES.slice(3, 11).map((p) => (
                  <button
                    key={p.name}
                    onClick={() => onChange((prev) => ({ ...prev, printColor1: p.hex }))}
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0 hover:scale-110 transition-transform"
                    style={{ backgroundColor: p.hex }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>

            {/* Color 2 */}
            <div className="bg-[#181a20] p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/90">Secondary Accent</span>
                <span className="font-mono text-[11px] text-white/50 uppercase">
                  {config.printColor2}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.printColor2}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, printColor2: e.target.value }))
                  }
                  className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0"
                />
                <span className="text-[11px] text-white/50">Secondary accents</span>
              </div>

              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                {ARTISANAL_PALETTES.slice(7, 15).map((p) => (
                  <button
                    key={p.name}
                    onClick={() => onChange((prev) => ({ ...prev, printColor2: p.hex }))}
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0 hover:scale-110 transition-transform"
                    style={{ backgroundColor: p.hex }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3. Scale, Rotation & Opacity Controls */}
          <div className="space-y-4 bg-[#181a20] p-3.5 rounded-xl border border-white/5">
            {/* Pattern Repeat Scale */}
            <div>
              <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
                <span>Pattern Scale</span>
                <span className="font-mono text-white/50 text-[11px]">
                  {Math.round(config.printScale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.3}
                max={2.5}
                step={0.1}
                value={config.printScale}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, printScale: parseFloat(e.target.value) }))
                }
                className="w-full accent-[#c29b62] h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Pattern Rotation */}
            <div>
              <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
                <span>Print Angle / Rotation</span>
                <span className="font-mono text-white/50 text-[11px]">
                  {config.printRotation}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={15}
                value={config.printRotation}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, printRotation: parseInt(e.target.value) }))
                }
                className="w-full accent-[#c29b62] h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
                <span>Ink Saturation / Opacity</span>
                <span className="font-mono text-white/50 text-[11px]">
                  {Math.round(config.printOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={config.printOpacity}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, printOpacity: parseFloat(e.target.value) }))
                }
                className="w-full accent-[#c29b62] h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 4. Ink Transfer Blend Mode */}
          <div>
            <label className="text-xs font-semibold text-white/90 uppercase tracking-wider block mb-2.5">
              Dye Absorption Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BLEND_MODES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onChange((prev) => ({ ...prev, printBlendMode: b.id }))}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                    config.printBlendMode === b.id
                      ? 'bg-white/15 border-white/40 text-white font-medium shadow-sm'
                      : 'bg-[#181a20] border-white/5 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="font-medium">{b.label}</div>
                  <div className="text-[11px] text-white/40 truncate mt-0.5">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
