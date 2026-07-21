import {
  BoxGeometry,
  type BufferGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  LatheGeometry,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector2,
} from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';

import type {
  BoxGeometryParams,
  CapsuleGeometryParams,
  ConeGeometryParams,
  CylinderGeometryParams,
  GeometryParams,
  LatheGeometryParams,
  PlaneGeometryParams,
  PrimitiveType,
  RoundedBoxGeometryParams,
  SphereGeometryParams,
  TorusGeometryParams,
} from '@/features/editor/types/scene';

/**
 * 화면 렌더링(PrimitiveGeometry.tsx)과 GLB 내보내기(glbExporter.ts)가 공통으로 쓰는
 * 명령형 geometry 생성기. 테이퍼/휘어짐 모디파이어는 이 결과에 modifiers.ts가 후처리로 적용된다.
 */
export function createGeometryInstance(type: PrimitiveType, params: GeometryParams): BufferGeometry {
  switch (type) {
    case 'box': {
      const { width, height, depth } = params as BoxGeometryParams;
      return new BoxGeometry(width, height, depth);
    }
    case 'roundedBox': {
      const { width, height, depth, radius, smoothness } = params as RoundedBoxGeometryParams;
      return new RoundedBoxGeometry(width, height, depth, smoothness, radius);
    }
    case 'sphere': {
      const { radius, widthSegments, heightSegments } = params as SphereGeometryParams;
      return new SphereGeometry(radius, widthSegments, heightSegments);
    }
    case 'capsule': {
      const { radius, length, capSegments, radialSegments } = params as CapsuleGeometryParams;
      return new CapsuleGeometry(radius, length, capSegments, radialSegments);
    }
    case 'cylinder': {
      const { radiusTop, radiusBottom, height, radialSegments } = params as CylinderGeometryParams;
      return new CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    }
    case 'cone': {
      const { radius, height, radialSegments } = params as ConeGeometryParams;
      return new ConeGeometry(radius, height, radialSegments);
    }
    case 'plane': {
      const { width, height } = params as PlaneGeometryParams;
      return new PlaneGeometry(width, height);
    }
    case 'torus': {
      const { radius, tube, radialSegments, tubularSegments, arc } = params as TorusGeometryParams;
      return new TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
    }
    case 'lathe': {
      const { profile, segments, phiStart, phiLength } = params as LatheGeometryParams;
      const points = profile.map((point) => new Vector2(point.radius, point.y));
      return new LatheGeometry(points, segments, phiStart, phiLength);
    }
  }
}
