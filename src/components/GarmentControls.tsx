/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ARTISANAL_PALETTES, FabricConfig, GarmentSilhouette, LightingPreset } from '../types/fabric';
import { Sun, Sparkles, Sliders } from 'lucide-react';

interface GarmentControlsProps {
  config: FabricConfig;
  onChange: (updater: (prev: FabricConfig) => FabricConfig) => void;
}

const SILHOUETTES: { id: GarmentSilhouette; label: string; desc: string }[] = [
  { id: 'oversized_shirt', label: 'Cuban Shirt', desc: 'Camp collar relaxed tailoring' },
  { id: 'kimono_robe', label: 'Haori Kimono', desc: 'Flowing sleeves & Obi sash belt' },
  { id: 'tailored_blazer', label: 'Tailored Blazer', desc: 'Structured lapels & welt pockets' },
  { id: 'minimalist_tote', label: 'Architectural Tote', desc: 'Box gusset & webbing straps' },
  { id: 'draped_swatch', label: 'Draped Swatch', desc: 'Showroom fluid cloth fold wave' },
  { id: 'cushion_pillow', label: 'Cushion Pillow', desc: 'Volumetric French seam piping' },
];

const BUTTON_FINISHES: { id: FabricConfig['buttonFinish']; label: string }[] = [
  { id: 'horn', label: 'Smoked Horn' },
  { id: 'mother_of_pearl', label: 'Pearl Luster' },
  { id: 'brass', label: 'Burnished Brass' },
  { id: 'matte_black', label: 'Matte Obsidian' },
];

const LIGHTING_PRESETS: { id: LightingPreset; label: string; desc: string }[] = [
  { id: 'studio_soft', label: 'Studio Softbox', desc: 'Balanced 3-point daylight' },
  { id: 'golden_hour', label: 'Golden Hour', desc: 'Warm 3200K sunset casting' },
  { id: 'nordic_atelier', label: 'Nordic Window', desc: 'Crisp 6000K diffused skylight' },
  { id: 'dramatic_editorial', label: 'Editorial Rim', desc: 'High-contrast focused spotlight' },
];

export const GarmentControls: React.FC<GarmentControlsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      {/* 1. Garment Silhouette */}
      <div>
        <label className="text-xs font-semibold text-white/90 uppercase tracking-wider block mb-2.5">
          Garment & Silhouette Form
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SILHOUETTES.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange((prev) => ({ ...prev, silhouette: s.id }))}
              className={`text-left p-2.5 rounded-lg border transition-all ${
                config.silhouette === s.id
                  ? 'bg-[#c29b62]/15 border-[#c29b62] text-white shadow-sm'
                  : 'bg-[#181a20] border-white/5 text-white/70 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="text-xs font-medium">{s.label}</div>
              <div className="text-[11px] text-white/40 truncate mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Contrast Trims & Accents */}
      <div className="bg-[#181a20] p-3.5 rounded-xl border border-white/5 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/90">
              Contrast Trim (Collar, Straps, Belts)
            </span>
            <span className="font-mono text-[11px] text-white/50 uppercase">{config.trimColor}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.trimColor}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, trimColor: e.target.value }))
              }
              className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0"
            />
            <span className="text-[11px] text-white/50">Applies to architectural accents</span>
          </div>

          {/* Quick Swatches */}
          <div className="flex items-center gap-1.5 pt-2 overflow-x-auto pb-1">
            {ARTISANAL_PALETTES.slice(0, 10).map((p) => (
              <button
                key={p.name}
                onClick={() => onChange((prev) => ({ ...prev, trimColor: p.hex }))}
                className="w-4 h-4 rounded-full border border-white/20 shrink-0 hover:scale-110 transition-transform"
                style={{ backgroundColor: p.hex }}
                title={p.name}
              />
            ))}
          </div>
        </div>

        {/* Hardware / Button Finish */}
        <div>
          <label className="text-xs font-medium text-white/90 block mb-2">
            Fastener & Hardware Finish
          </label>
          <div className="grid grid-cols-2 gap-2">
            {BUTTON_FINISHES.map((b) => (
              <button
                key={b.id}
                onClick={() => onChange((prev) => ({ ...prev, buttonFinish: b.id }))}
                className={`px-2.5 py-1.5 rounded-lg border text-xs text-left transition-all ${
                  config.buttonFinish === b.id
                    ? 'bg-white/15 border-white/40 text-white font-medium shadow-sm'
                    : 'bg-[#121418] border-white/5 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Studio Lighting Atmosphere */}
      <div>
        <label className="text-xs font-semibold text-white/90 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-[#c29b62]" />
          <span>Atelier Lighting Environment</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LIGHTING_PRESETS.map((light) => (
            <button
              key={light.id}
              onClick={() => onChange((prev) => ({ ...prev, lightingPreset: light.id }))}
              className={`text-left p-2.5 rounded-lg border transition-all ${
                config.lightingPreset === light.id
                  ? 'bg-white/15 border-white/40 text-white font-medium shadow-sm'
                  : 'bg-[#181a20] border-white/5 text-white/70 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="text-xs font-medium">{light.label}</div>
              <div className="text-[11px] text-white/40 truncate mt-0.5">{light.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
