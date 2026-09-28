/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ViewMode } from '../types/fabric';
import { FileText, Download } from 'lucide-react';

interface TopNavProps {
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onOpenPresets: () => void;
  onOpenTechPack: () => void;
  onExportTile: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  viewMode,
  onSetViewMode,
  onOpenPresets,
  onOpenTechPack,
  onExportTile,
}) => {
  return (
    <header className="w-full h-16 border-b border-white/10 bg-[#0e1013]/95 backdrop-blur-md px-6 flex items-center justify-between z-40 sticky top-0">
      {/* Zone 1: Single text element wordmark in display face */}
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
        }}
        className="text-xl font-serif font-bold tracking-tight text-white hover:text-[#c29b62] transition-colors whitespace-nowrap shrink-0"
      >
        Atelier Weave
      </a>

      {/* Zone 2: 4-5 clean text navigation links / viewport modes */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-white/70">
        <button
          onClick={() => onSetViewMode('split')}
          className={`transition-colors whitespace-nowrap ${
            viewMode === 'split' ? 'text-[#c29b62] font-semibold' : 'hover:text-white'
          }`}
        >
          Dual Studio
        </button>

        <button
          onClick={() => onSetViewMode('garment_3d')}
          className={`transition-colors whitespace-nowrap ${
            viewMode === 'garment_3d' ? 'text-[#c29b62] font-semibold' : 'hover:text-white'
          }`}
        >
          3D Silhouette
        </button>

        <button
          onClick={() => onSetViewMode('macro_weave')}
          className={`transition-colors whitespace-nowrap ${
            viewMode === 'macro_weave' ? 'text-[#c29b62] font-semibold' : 'hover:text-white'
          }`}
        >
          Macro Threads
        </button>

        <button
          onClick={onOpenPresets}
          className="hover:text-white transition-colors whitespace-nowrap"
        >
          Textile Archives
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenTechPack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors whitespace-nowrap"
        >
          <FileText className="w-3.5 h-3.5 text-[#c29b62]" />
          <span>Mill Spec</span>
        </button>

        <button
          onClick={onExportTile}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-black bg-[#c29b62] hover:bg-[#d4af37] rounded-lg transition-colors whitespace-nowrap shadow-sm font-semibold"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Swatch</span>
        </button>
      </div>
    </header>
  );
};
