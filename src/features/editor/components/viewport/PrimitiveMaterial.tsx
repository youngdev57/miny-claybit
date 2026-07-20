import { DoubleSide, FrontSide } from 'three';

import type { MaterialState } from '@/features/editor/types/material';

interface PrimitiveMaterialProps {
  material: MaterialState;
}

function PrimitiveMaterial({ material }: PrimitiveMaterialProps) {
  return (
    <meshStandardMaterial
      color={material.color}
      roughness={material.roughness}
      metalness={material.metalness}
      opacity={material.opacity}
      transparent={material.transparent}
      emissive={material.emissive}
      emissiveIntensity={material.emissiveIntensity}
      flatShading={material.flatShading}
      side={material.doubleSided ? DoubleSide : FrontSide}
    />
  );
}

export default PrimitiveMaterial;
