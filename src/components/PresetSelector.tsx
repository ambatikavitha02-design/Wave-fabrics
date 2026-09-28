/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PRESET_FABRICS, FabricConfig } from '../types/fabric';
import { Bookmark, Sparkles } from 'lucide-react';
import atelierLoomImg from '../assets/images/atelier_textile_loom_1790586148270.jpg';

interface PresetSelectorProps {
  currentPresetId?: string;
  onSelectPreset: (presetConfig: Partial<FabricConfig>, presetName: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  currentPresetId,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-4">
      {/* Editorial Atelier Banner */}
      <div className="relative rounded-xl overflow-hidden border border-white/10 group">
        <img
          src={atelierLoomImg}
          alt="Artisanal Handloom Textile Studio"
          referrerPolicy="no-referrer"
          className="w-full h-28 object-cover brightness-75 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 flex flex-col justify-end">
          <div className="text-[10px] text-[#c29b62] font-semibold uppercase tracking-wider">
            Heritage Mill Archive
          </div>
          <div className="text-xs text-white/90 font-serif font-medium mt-0.5">
            Centuries of weave architecture & dye traditions
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-[#c29b62]" />
          <span>Curated Textile Archives</span>
        </label>
        <span className="text-[11px] text-white/40">{PRESET_FABRICS.length} Mill Presets</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {PRESET_FABRICS.map((preset) => {
          const isSelected = currentPresetId === preset.id;
          const warp = preset.config.warpColor || '#172744';
          const weft = preset.config.weftColor || '#e8e2d2';

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.config, preset.name)}
              className={`text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#c29b62]/15 border-[#c29b62] shadow-sm'
                  : 'bg-[#181a20] border-white/5 hover:border-white/20 hover:bg-[#1f232c]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-white tracking-wide truncate">
                    {preset.name}
                  </h4>
                  {/* Swatch dual yarn circle */}
                  <div className="flex items-center -space-x-1.5 shrink-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/50"
                      style={{ backgroundColor: warp }}
                      title={`Warp: ${warp}`}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/50"
                      style={{ backgroundColor: weft }}
                      title={`Weft: ${weft}`}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-[#c29b62]/90 mt-0.5 font-medium">
                  {preset.origin}
                </div>

                <p className="text-[11px] text-white/50 line-clamp-2 mt-1.5 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/5 text-[10px] text-white/40">
                <span className="capitalize">{preset.config.weaveType?.replace('_', ' ')}</span>
                <span>·</span>
                <span className="capitalize">{preset.config.silhouette?.replace('_', ' ')}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
