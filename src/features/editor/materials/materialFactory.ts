import { DoubleSide, FrontSide, MeshStandardMaterial } from 'three';

import { MATERIAL_PRESETS, type MaterialPresetId } from '@/features/editor/materials/materialPresets';
import type { MaterialState } from '@/features/editor/types/material';

export function applyMaterialPreset(material: MaterialState, presetId: MaterialPresetId): MaterialState {
  return { ...material, ...MATERIAL_PRESETS[presetId] };
}

/** GLB 내보내기 등 실제 three.js Object3D 그래프가 필요한 경우를 위한 명령형 재질 생성기. */
export function createThreeMaterial(material: MaterialState): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: material.color,
    roughness: material.roughness,
    metalness: material.metalness,
    opacity: material.opacity,
    transparent: material.transparent,
    emissive: material.emissive,
    emissiveIntensity: material.emissiveIntensity,
    flatShading: material.flatShading,
    side: material.doubleSided ? DoubleSide : FrontSide,
  });
}
