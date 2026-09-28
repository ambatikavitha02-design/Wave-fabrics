/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeaveType = 
  | 'plain'
  | 'twill_2_2'
  | 'twill_herringbone'
  | 'houndstooth'
  | 'satin_5'
  | 'waffle'
  | 'oxford'
  | 'custom';

export type FiberSheen = 'matte_cotton' | 'raw_linen' | 'silk_luster' | 'wool_tweed' | 'satin_gloss';

export type GarmentSilhouette = 
  | 'oversized_shirt'
  | 'kimono_robe'
  | 'tailored_blazer'
  | 'minimalist_tote'
  | 'draped_swatch'
  | 'cushion_pillow';

export type PrintMotif = 
  | 'none'
  | 'botanical_leaves'
  | 'bauhaus_geometry'
  | 'bengal_stripe'
  | 'tartan_grid'
  | 'shibori_indigo'
  | 'terrazzo_fleck'
  | 'micro_polka';

export type LightingPreset = 'studio_soft' | 'golden_hour' | 'nordic_atelier' | 'dramatic_editorial';

export type ViewMode = 'split' | 'garment_3d' | 'macro_weave';

export interface FabricConfig {
  id: string;
  name: string;
  weaveType: WeaveType;
  customMatrix: boolean[][]; // 8x8 or 16x16 boolean array (true = warp up, false = weft up)
  
  // Yarn Colors
  warpColor: string;
  weftColor: string;
  
  // Physical Thread specs
  threadDensityWarp: number; // 30 - 140 ends per inch
  threadDensityWeft: number; // 30 - 140 picks per inch
  yarnGauge: number; // 1 (ultra fine) to 5 (chunky coarse)
  slubIntensity: number; // 0 (uniform) to 1 (raw organic neps)
  fiberSheen: FiberSheen;
  twistDirection: 'Z-twist' | 'S-twist';
  
  // Surface Print Layer
  printMotif: PrintMotif;
  printColor1: string;
  printColor2: string;
  printScale: number; // 0.2 to 3.0
  printRotation: number; // 0 to 360 deg
  printOpacity: number; // 0 to 1
  printBlendMode: 'normal' | 'multiply' | 'overlay' | 'screen';
  
  // Garment Customization
  silhouette: GarmentSilhouette;
  trimColor: string; // collar, cuffs, borders
  stitchingColor: string;
  stitchingVisible: boolean;
  buttonFinish: 'horn' | 'mother_of_pearl' | 'brass' | 'matte_black';
  
  // Environment
  lightingPreset: LightingPreset;
  roughness: number; // 0.1 to 0.95
  metalness: number; // 0 to 0.3
}

export interface PresetFabric {
  id: string;
  name: string;
  origin: string;
  description: string;
  config: Partial<FabricConfig>;
}

export const PRESET_FABRICS: PresetFabric[] = [
  {
    id: 'kyoto-indigo-kasuri',
    name: 'Kyoto Kasuri Indigo',
    origin: 'Honshu, Japan',
    description: 'Deep indigo warp with ecru cross-dyed weft in chevron twill structure. Organic slubbed texture.',
    config: {
      weaveType: 'twill_herringbone',
      warpColor: '#172744',
      weftColor: '#e8e2d2',
      yarnGauge: 3,
      slubIntensity: 0.65,
      fiberSheen: 'raw_linen',
      printMotif: 'none',
      silhouette: 'kimono_robe',
      trimColor: '#0f172a',
      stitchingColor: '#c29b62',
      buttonFinish: 'brass',
    },
  },
  {
    id: 'venetian-mulberry-silk',
    name: 'Venetian Mulberry Silk',
    origin: 'Veneto, Italy',
    description: 'High-float 5-harness satin weave pairing deep ruby warp with molten gold weft for dynamic shot-silk iridescence.',
    config: {
      weaveType: 'satin_5',
      warpColor: '#7a1426',
      weftColor: '#d4af37',
      yarnGauge: 1,
      slubIntensity: 0.05,
      fiberSheen: 'silk_luster',
      printMotif: 'none',
      silhouette: 'oversized_shirt',
      trimColor: '#4f0d19',
      stitchingColor: '#d4af37',
      buttonFinish: 'mother_of_pearl',
    },
  },
  {
    id: 'donegal-highland-tweed',
    name: 'Donegal Heather Tweed',
    origin: 'Donegal, Ireland',
    description: 'Heavy 2/2 wool twill interwoven with moss green, heather oat, and flecks of burnt ochre.',
    config: {
      weaveType: 'twill_2_2',
      warpColor: '#364332',
      weftColor: '#8a795d',
      yarnGauge: 4.5,
      slubIntensity: 0.85,
      fiberSheen: 'wool_tweed',
      printMotif: 'terrazzo_fleck',
      printColor1: '#b45309',
      printColor2: '#1e293b',
      printScale: 0.8,
      printOpacity: 0.45,
      printBlendMode: 'overlay',
      silhouette: 'tailored_blazer',
      trimColor: '#283225',
      stitchingColor: '#b45309',
      buttonFinish: 'horn',
    },
  },
  {
    id: 'savile-row-bengal',
    name: 'Savile Row Bengal Stripe',
    origin: 'London, UK',
    description: 'Crisp combed cotton twill featuring alternating nautical navy and chalk white Bengal shirting stripes.',
    config: {
      weaveType: 'twill_2_2',
      warpColor: '#1e3a5f',
      weftColor: '#ffffff',
      yarnGauge: 1.5,
      slubIntensity: 0.1,
      fiberSheen: 'matte_cotton',
      printMotif: 'bengal_stripe',
      printColor1: '#1e3a5f',
      printColor2: '#ffffff',
      printScale: 1.2,
      printOpacity: 0.9,
      printBlendMode: 'normal',
      silhouette: 'oversized_shirt',
      trimColor: '#ffffff',
      stitchingColor: '#1e3a5f',
      buttonFinish: 'mother_of_pearl',
    },
  },
  {
    id: 'provence-botanical-linen',
    name: 'Provence Botanical Linen',
    origin: 'Aix-en-Provence, France',
    description: 'Unbleached natural flax plain weave with soft sage and olive leaf block-print relief overlay.',
    config: {
      weaveType: 'plain',
      warpColor: '#ded5c4',
      weftColor: '#c8bc9f',
      yarnGauge: 3,
      slubIntensity: 0.5,
      fiberSheen: 'raw_linen',
      printMotif: 'botanical_leaves',
      printColor1: '#4a5d4e',
      printColor2: '#7d8f78',
      printScale: 1.5,
      printOpacity: 0.85,
      printBlendMode: 'multiply',
      silhouette: 'minimalist_tote',
      trimColor: '#39463b',
      stitchingColor: '#ded5c4',
      buttonFinish: 'brass',
    },
  },
  {
    id: 'wabi-sabi-waffle',
    name: 'Terracotta Waffle Weave',
    origin: 'Kyoto, Japan',
    description: 'Three-dimensional honeycomb waffle weave with rich burnt terracotta warp and umber weft, creating deep thermal pockets.',
    config: {
      weaveType: 'waffle',
      warpColor: '#ab4a33',
      weftColor: '#5c2b20',
      yarnGauge: 3.5,
      slubIntensity: 0.4,
      fiberSheen: 'matte_cotton',
      printMotif: 'none',
      silhouette: 'cushion_pillow',
      trimColor: '#5c2b20',
      stitchingColor: '#e07a5f',
      buttonFinish: 'horn',
    },
  },
  {
    id: 'houndstooth-monochrome',
    name: 'Monochrome Houndstooth',
    origin: 'Scottish Lowlands',
    description: 'Classic 4x4 color-and-weave houndstooth suiting wool with sharp geometric interlocking tooth motifs.',
    config: {
      weaveType: 'houndstooth',
      warpColor: '#18181b',
      weftColor: '#f4f4f5',
      yarnGauge: 2.5,
      slubIntensity: 0.2,
      fiberSheen: 'wool_tweed',
      printMotif: 'none',
      silhouette: 'tailored_blazer',
      trimColor: '#09090b',
      stitchingColor: '#71717a',
      buttonFinish: 'horn',
    },
  }
];

export const ARTISANAL_PALETTES = [
  { name: 'Natural Ecru & Raw Flax', hex: '#EAE5D9' },
  { name: 'Bleached Chalk White', hex: '#F8F9FA' },
  { name: 'Sumi Japanese Charcoal', hex: '#1C1E21' },
  { name: 'Hon-Aizome Deep Indigo', hex: '#16284F' },
  { name: 'Kuro-Cha Dark Chestnut', hex: '#3B2F2F' },
  { name: 'Madder Root Crimson', hex: '#7A1A28' },
  { name: 'Terracotta Clay', hex: '#B85338' },
  { name: 'Ochre Yellow Mineral', hex: '#CFA043' },
  { name: 'Sage & Wild Olive', hex: '#58674E' },
  { name: 'Eucalyptus Glauca', hex: '#7A9188' },
  { name: 'French Hydrangea Slate', hex: '#48566E' },
  { name: 'Mulberry Silk Plum', hex: '#522A45' },
  { name: 'Cashmere Camel', hex: '#B48B57' },
  { name: 'Raw Umber Loam', hex: '#4A3B32' },
  { name: 'Lapis Lazuli Cobalt', hex: '#1B4D89' },
  { name: 'Verdigris Patina', hex: '#4B7B70' },
];
