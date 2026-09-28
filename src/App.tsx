/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FabricConfig, ViewMode, PRESET_FABRICS } from './types/fabric';
import { TopNav } from './components/TopNav';
import { ThreeGarmentViewer } from './components/ThreeGarmentViewer';
import { MacroWeaveCanvas } from './components/MacroWeaveCanvas';
import { WeaveControls } from './components/WeaveControls';
import { PrintControls } from './components/PrintControls';
import { GarmentControls } from './components/GarmentControls';
import { PresetSelector } from './components/PresetSelector';
import { TechPackModal } from './components/TechPackModal';
import { calculateTextileMetrics, generateFabricCanvasTexture } from './utils/weaveGenerator';
import { Bookmark, Layers, Palette, Sparkles, Shirt } from 'lucide-react';

const INITIAL_CONFIG: FabricConfig = {
  id: 'custom-cloth-01',
  name: 'Kyoto Kasuri Indigo',
  weaveType: 'twill_herringbone',
  customMatrix: [],
  warpColor: '#172744',
  weftColor: '#e8e2d2',
  threadDensityWarp: 75,
  threadDensityWeft: 65,
  yarnGauge: 2.5,
  slubIntensity: 0.55,
  fiberSheen: 'raw_linen',
  twistDirection: 'Z-twist',
  printMotif: 'none',
  printColor1: '#264b6e',
  printColor2: '#b85338',
  printScale: 1.0,
  printRotation: 0,
  printOpacity: 0.85,
  printBlendMode: 'multiply',
  silhouette: 'oversized_shirt',
  trimColor: '#0f172a',
  stitchingColor: '#c29b62',
  stitchingVisible: true,
  buttonFinish: 'brass',
  lightingPreset: 'studio_soft',
  roughness: 0.8,
  metalness: 0.05,
};

type ActiveTab = 'weave' | 'print' | 'garment' | 'presets';

export default function App() {
  const [config, setConfig] = useState<FabricConfig>(INITIAL_CONFIG);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [activeTab, setActiveTab] = useState<ActiveTab>('weave');
  const [techPackOpen, setTechPackOpen] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>('kyoto-indigo-kasuri');

  const metrics = calculateTextileMetrics(config);

  const handleSelectPreset = (presetConfig: Partial<FabricConfig>, name: string) => {
    setConfig((prev) => ({
      ...prev,
      ...presetConfig,
      name,
    }));
    const found = PRESET_FABRICS.find((p) => p.name === name);
    if (found) {
      setActivePresetId(found.id);
    }
  };

  const handleExportTile = () => {
    const tile = generateFabricCanvasTexture(config, 1024);
    const link = document.createElement('a');
    link.href = tile.toDataURL('image/png');
    link.download = `${config.name.toLowerCase().replace(/\s+/g, '-')}-seamless-swatch.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0e1013] text-[#e8eaed] flex flex-col font-sans">
      {/* 1. Universal Top Navigation Contract */}
      <TopNav
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        onOpenPresets={() => setActiveTab('presets')}
        onOpenTechPack={() => setTechPackOpen(true)}
        onExportTile={handleExportTile}
      />

      {/* 2. Editorial Studio Sub-Header */}
      <div className="w-full border-b border-white/5 bg-[#121419] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
            className="text-base font-serif font-bold text-white bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#c29b62] focus:outline-none transition-colors px-1 py-0.5"
            placeholder="Fabric Specimen Name"
          />

          {/* Zero-Pill Typography Metadata Separators */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
            <span className="capitalize">{config.weaveType.replace('_', ' ')}</span>
            <span aria-hidden="true">·</span>
            <span>{metrics.gsm}</span>
            <span aria-hidden="true">·</span>
            <span>{metrics.threadCount}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{config.fiberSheen.replace('_', ' ')}</span>
          </div>
        </div>

        {/* View Switcher Tabs (Buttons with click handlers) */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-lg border border-white/5 text-xs">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              viewMode === 'split'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Dual Studio
          </button>
          <button
            onClick={() => setViewMode('garment_3d')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              viewMode === 'garment_3d'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            3D Garment
          </button>
          <button
            onClick={() => setViewMode('macro_weave')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              viewMode === 'macro_weave'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Macro Threads
          </button>
        </div>
      </div>

      {/* 3. Main Workspace: Viewport Area & Configuration Inspector */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Visual Canvas & 3D Center Stage */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 h-full min-h-[580px]">
              {/* Left Viewport: 3D Garment Studio */}
              <div className="h-[460px] xl:h-full min-h-[460px] flex flex-col">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-[#c29b62]" />
                    3D Garment & Silhouette Studio
                  </span>
                  <span className="text-[11px] font-normal text-white/40">
                    WebGL · 360° Inspection
                  </span>
                </div>
                <div className="flex-1 min-h-0">
                  <ThreeGarmentViewer config={config} />
                </div>
              </div>

              {/* Right Viewport: Macro Thread Simulation & Loom Draft */}
              <div className="h-[460px] xl:h-full min-h-[460px] flex flex-col">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#c29b62]" />
                    Tactile Yarn & Loom Harness
                  </span>
                  <span className="text-[11px] font-normal text-white/40">
                    Microscopic Thread Interlacing
                  </span>
                </div>
                <div className="flex-1 min-h-0">
                  <MacroWeaveCanvas config={config} onUpdateConfig={setConfig} />
                </div>
              </div>
            </div>
          )}

          {viewMode === 'garment_3d' && (
            <div className="h-full min-h-[620px] flex flex-col">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-[#c29b62]" />
                  Full 3D Garment & Drapery Inspection
                </span>
                <span className="text-[11px] font-normal text-white/40">
                  Click and drag to orbit
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <ThreeGarmentViewer config={config} />
              </div>
            </div>
          )}

          {viewMode === 'macro_weave' && (
            <div className="h-full min-h-[620px] flex flex-col">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#c29b62]" />
                  High-Resolution Yarn & Drawdown Matrix
                </span>
                <span className="text-[11px] font-normal text-white/40">
                  Ends & Picks Thread Physics
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <MacroWeaveCanvas config={config} onUpdateConfig={setConfig} />
              </div>
            </div>
          )}
        </div>

        {/* Right Inspector Sidebar: Tabs & Controls */}
        <aside className="w-full lg:w-[420px] xl:w-[460px] bg-[#14171d] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col shrink-0">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-white/10 px-2 pt-2 bg-[#171a21]">
            <button
              onClick={() => setActiveTab('weave')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'weave'
                  ? 'border-[#c29b62] text-white font-semibold'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Weave & Yarn</span>
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'print'
                  ? 'border-[#c29b62] text-white font-semibold'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Prints</span>
            </button>

            <button
              onClick={() => setActiveTab('garment')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'garment'
                  ? 'border-[#c29b62] text-white font-semibold'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Garment</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'presets'
                  ? 'border-[#c29b62] text-white font-semibold'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Archives</span>
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div className="p-5 overflow-y-auto flex-1">
            {activeTab === 'weave' && <WeaveControls config={config} onChange={setConfig} />}

            {activeTab === 'print' && <PrintControls config={config} onChange={setConfig} />}

            {activeTab === 'garment' && <GarmentControls config={config} onChange={setConfig} />}

            {activeTab === 'presets' && (
              <PresetSelector
                currentPresetId={activePresetId}
                onSelectPreset={handleSelectPreset}
              />
            )}
          </div>

          {/* Sidebar Footer: Quick Spec Summary */}
          <div className="p-4 bg-[#101217] border-t border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white/40">Density:</span>
              <span className="font-mono text-white/80 tabular-nums">
                {config.threadDensityWarp}E × {config.threadDensityWeft}P
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40">Weight:</span>
              <span className="font-mono font-semibold text-[#c29b62] tabular-nums">
                {metrics.gsm}
              </span>
            </div>
          </div>
        </aside>
      </main>

      {/* 4. Tech Pack Production Modal */}
      <TechPackModal
        config={config}
        isOpen={techPackOpen}
        onClose={() => setTechPackOpen(false)}
      />
    </div>
  );
}
