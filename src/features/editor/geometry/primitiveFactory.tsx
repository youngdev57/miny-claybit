import { extend, type BufferGeometryNode } from '@react-three/fiber';
import {
  BoxGeometry,
  type BufferGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  PlaneGeometry,
  SphereGeometry,
} from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';

import type {
  BoxGeometryParams,
  CapsuleGeometryParams,
  ConeGeometryParams,
  CylinderGeometryParams,
  GeometryParams,
  PlaneGeometryParams,
  PrimitiveType,
  RoundedBoxGeometryParams,
  SphereGeometryParams,
} from '@/features/editor/types/scene';

extend({ RoundedBoxGeometry });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- TS 전역 JSX 인트린식 확장에 필요한 표준 패턴
  namespace JSX {
    interface IntrinsicElements {
      roundedBoxGeometry: BufferGeometryNode<RoundedBoxGeometry, typeof RoundedBoxGeometry>;
    }
  }
}

export function createGeometryElement(type: PrimitiveType, params: GeometryParams) {
  switch (type) {
    case 'box': {
      const { width, height, depth } = params as BoxGeometryParams;
      return <boxGeometry args={[width, height, depth]} />;
    }
    case 'roundedBox': {
      const { width, height, depth, radius, smoothness } = params as RoundedBoxGeometryParams;
      return <roundedBoxGeometry args={[width, height, depth, smoothness, radius]} />;
    }
    case 'sphere': {
      const { radius, widthSegments, heightSegments } = params as SphereGeometryParams;
      return <sphereGeometry args={[radius, widthSegments, heightSegments]} />;
    }
    case 'capsule': {
      const { radius, length, capSegments, radialSegments } = params as CapsuleGeometryParams;
      return <capsuleGeometry args={[radius, length, capSegments, radialSegments]} />;
    }
    case 'cylinder': {
      const { radiusTop, radiusBottom, height, radialSegments } = params as CylinderGeometryParams;
      return <cylinderGeometry args={[radiusTop, radiusBottom, height, radialSegments]} />;
    }
    case 'cone': {
      const { radius, height, radialSegments } = params as ConeGeometryParams;
      return <coneGeometry args={[radius, height, radialSegments]} />;
    }
    case 'plane': {
      const { width, height } = params as PlaneGeometryParams;
      return <planeGeometry args={[width, height]} />;
    }
  }
}

/** GLB 내보내기 등 실제 three.js Object3D 그래프가 필요한 경우를 위한 명령형 geometry 생성기. */
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
  }
}
