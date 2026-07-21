import { useEffect, useMemo } from 'react';
import type { BufferGeometry } from 'three';

import { applyModifiers } from '@/features/editor/geometry/modifiers';
import { createGeometryInstance } from '@/features/editor/geometry/primitiveFactory';
import type { GeometryParams, ObjectModifiers, PrimitiveType } from '@/features/editor/types/scene';

interface PrimitiveGeometryProps {
  type: PrimitiveType;
  geometryParams: GeometryParams;
  modifiers?: ObjectModifiers | null;
}

/**
 * 테이퍼/휘어짐 모디파이어는 정점을 직접 변형해야 하므로 선언적 `<xGeometry args={...}/>` 대신
 * imperative BufferGeometry를 만들어 attach한다. GLB 내보내기(glbExporter.ts)와 동일한
 * createGeometryInstance + applyModifiers 경로를 재사용해 화면과 내보내기 결과가 항상 일치한다.
 */
function PrimitiveGeometry({ type, geometryParams, modifiers }: PrimitiveGeometryProps) {
  const geometry = useMemo<BufferGeometry>(() => {
    const base = createGeometryInstance(type, geometryParams);
    return applyModifiers(base, modifiers);
  }, [type, geometryParams, modifiers]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return <primitive object={geometry} attach="geometry" />;
}

export default PrimitiveGeometry;
