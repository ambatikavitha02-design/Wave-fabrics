/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, Palette, Scissors } from 'lucide-react';
import { FabricConfig } from '../types/fabric';
import { calculateTextileMetrics, generateFabricCanvasTexture } from '../utils/weaveGenerator';

interface TechPackModalProps {
  config: FabricConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const TechPackModal: React.FC<TechPackModalProps> = ({ config, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const metrics = calculateTextileMetrics(config);

  const handleDownloadTile = () => {
    const tile = generateFabricCanvasTexture(config, 1024);
    const link = document.createElement('a');
    link.href = tile.toDataURL('image/png');
    link.download = `atelier-tech-swatch-${config.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const handleCopyJSON = () => {
    const techPackData = {
      specVersion: '1.0-MillSpec',
      fabricName: config.name,
      weaveArchitecture: config.weaveType,
      yarnParameters: {
        warpColor: config.warpColor,
        weftColor: config.weftColor,
        yarnGauge: config.yarnGauge,
        estimatedYarnCount: metrics.yarnCountNe,
        warpDensityEPI: config.threadDensityWarp,
        weftDensityPPI: config.threadDensityWeft,
        totalThreadCount: metrics.threadCount,
        organicSlubVariation: `${Math.round(config.slubIntensity * 100)}%`,
        fiberFinish: config.fiberSheen,
        yarnTwist: config.twistDirection,
      },
      physicalProperties: {
        weightGSM: metrics.gsm,
        weightOzSqYd: metrics.ozSqYd,
        intendedClassification: metrics.category,
      },
      surfacePrint: {
        motif: config.printMotif,
        primaryInk: config.printColor1,
        secondaryInk: config.printColor2,
        scale: `${Math.round(config.printScale * 100)}%`,
        rotationDeg: config.printRotation,
        dyeAbsorption: config.printBlendMode,
      },
      garmentDetails: {
        silhouette: config.silhouette,
        trimColor: config.trimColor,
        hardwareFinish: config.buttonFinish,
      },
    };

    navigator.clipboard.writeText(JSON.stringify(techPackData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#191d24]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c29b62]" />
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Mill Tech Pack & Specification Sheet
              </h3>
              <p className="text-xs text-white/50">{config.name} · CAD Production Parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Classification & Summary */}
          <div className="p-4 bg-[#191d24] rounded-xl border border-white/5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-[11px] text-[#c29b62] font-semibold uppercase tracking-wider">
                Classification
              </div>
              <div className="text-base font-serif font-bold text-white mt-0.5">
                {metrics.category}
              </div>
              <div className="text-xs text-white/50 mt-1">
                Weave: <span className="text-white capitalize">{config.weaveType.replace('_', ' ')}</span> · Finish: <span className="text-white capitalize">{config.fiberSheen.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] text-white/40 uppercase">Weight</div>
                <div className="text-lg font-mono font-bold text-white tabular-nums">
                  {metrics.gsm}
                </div>
                <div className="text-[11px] text-white/50 tabular-nums">{metrics.ozSqYd}</div>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <div className="text-[10px] text-white/40 uppercase">Thread Count</div>
                <div className="text-lg font-mono font-bold text-white tabular-nums">
                  {metrics.threadCount}
                </div>
                <div className="text-[11px] text-white/50">{metrics.yarnCountNe}</div>
              </div>
            </div>
          </div>

          {/* Loom & Yarn Construction Matrix */}
          <div>
            <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[#c29b62]" />
              <span>Loom & Yarn Construction</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#191d24] rounded-lg border border-white/5">
                <div className="text-[10px] text-white/40">Warp Density</div>
                <div className="text-xs font-mono font-semibold text-white mt-1 tabular-nums">
                  {metrics.epi}
                </div>
              </div>
              <div className="p-3 bg-[#191d24] rounded-lg border border-white/5">
                <div className="text-[10px] text-white/40">Weft Density</div>
                <div className="text-xs font-mono font-semibold text-white mt-1 tabular-nums">
                  {metrics.ppi}
                </div>
              </div>
              <div className="p-3 bg-[#191d24] rounded-lg border border-white/5">
                <div className="text-[10px] text-white/40">Slub Variation</div>
                <div className="text-xs font-mono font-semibold text-white mt-1 tabular-nums">
                  {Math.round(config.slubIntensity * 100)}% Organic
                </div>
              </div>
              <div className="p-3 bg-[#191d24] rounded-lg border border-white/5">
                <div className="text-[10px] text-white/40">Yarn Twist</div>
                <div className="text-xs font-mono font-semibold text-white mt-1">
                  {config.twistDirection}
                </div>
              </div>
            </div>
          </div>

          {/* Color Breakdown & Dye Recipes */}
          <div>
            <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#c29b62]" />
              <span>Dye Formulation & Swatch Samples</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Warp */}
              <div className="p-3 bg-[#191d24] rounded-lg border border-white/5 flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-md border border-white/20 shadow-inner shrink-0"
                  style={{ backgroundColor: config.warpColor }}
                />
                <div>
                  <div className="text-[10px] text-white/40">Warp Dye</div>
                  <div className="text-xs font-mono text-white uppercase">{config.warpColor}</div>
                </div>
              </div>

              {/* Weft */}
              <div className="p-3 bg-[#191d24] rounded-lg border border-white/5 flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-md border border-white/20 shadow-inner shrink-0"
                  style={{ backgroundColor: config.weftColor }}
                />
                <div>
                  <div className="text-[10px] text-white/40">Weft Dye</div>
                  <div className="text-xs font-mono text-white uppercase">{config.weftColor}</div>
                </div>
              </div>

              {/* Trim */}
              <div className="p-3 bg-[#191d24] rounded-lg border border-white/5 flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-md border border-white/20 shadow-inner shrink-0"
                  style={{ backgroundColor: config.trimColor }}
                />
                <div>
                  <div className="text-[10px] text-white/40">Architectural Trim</div>
                  <div className="text-xs font-mono text-white uppercase">{config.trimColor}</div>
                </div>
              </div>

              {/* Print ink */}
              <div className="p-3 bg-[#191d24] rounded-lg border border-white/5 flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-md border border-white/20 shadow-inner shrink-0"
                  style={{ backgroundColor: config.printMotif !== 'none' ? config.printColor1 : '#888888' }}
                />
                <div>
                  <div className="text-[10px] text-white/40">Print Pigment</div>
                  <div className="text-xs font-mono text-white uppercase">
                    {config.printMotif !== 'none' ? config.printColor1 : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#191d24] flex items-center justify-between gap-3">
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white/5 hover:bg-white/10 text-white/90 rounded-lg border border-white/10 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Tech Pack' : 'Copy JSON Spec'}</span>
          </button>

          <button
            onClick={handleDownloadTile}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#c29b62] hover:bg-[#d4af37] text-black font-semibold rounded-lg shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download 1024px Seamless Tile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
