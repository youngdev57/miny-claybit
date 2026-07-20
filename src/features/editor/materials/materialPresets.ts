import type { MaterialState } from '@/features/editor/types/material';

export type MaterialPresetId = 'matteClay' | 'rubber' | 'plastic' | 'glossyPlastic' | 'metal' | 'glass' | 'glow';

export const MATERIAL_PRESET_IDS: MaterialPresetId[] = [
  'matteClay',
  'rubber',
  'plastic',
  'glossyPlastic',
  'metal',
  'glass',
  'glow',
];

export const MATERIAL_PRESET_LABELS: Record<MaterialPresetId, string> = {
  matteClay: '무광 점토',
  rubber: '고무',
  plastic: '플라스틱',
  glossyPlastic: '유광 플라스틱',
  metal: '금속',
  glass: '유리',
  glow: '발광',
};

export const MATERIAL_PRESETS: Record<MaterialPresetId, Partial<MaterialState>> = {
  matteClay: { roughness: 0.9, metalness: 0, opacity: 1, transparent: false, emissiveIntensity: 0 },
  rubber: { roughness: 0.85, metalness: 0, opacity: 1, transparent: false, emissiveIntensity: 0 },
  plastic: { roughness: 0.4, metalness: 0, opacity: 1, transparent: false, emissiveIntensity: 0 },
  glossyPlastic: { roughness: 0.15, metalness: 0, opacity: 1, transparent: false, emissiveIntensity: 0 },
  metal: { roughness: 0.3, metalness: 1, opacity: 1, transparent: false, emissiveIntensity: 0 },
  glass: { roughness: 0.05, metalness: 0, opacity: 0.35, transparent: true, emissiveIntensity: 0 },
  glow: { roughness: 0.6, metalness: 0, opacity: 1, transparent: false, emissive: '#fbbf24', emissiveIntensity: 1.2 },
};
