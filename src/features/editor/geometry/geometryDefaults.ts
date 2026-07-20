import type {
  BoxGeometryParams,
  CapsuleGeometryParams,
  ConeGeometryParams,
  CylinderGeometryParams,
  GeometryParams,
  PrimitiveType,
  SphereGeometryParams,
} from '@/features/editor/types/scene';

export const PRIMITIVE_TYPES: PrimitiveType[] = [
  'box',
  'roundedBox',
  'sphere',
  'capsule',
  'cylinder',
  'cone',
  'plane',
];

export const PRIMITIVE_LABELS: Record<PrimitiveType, string> = {
  box: 'Box',
  roundedBox: 'Rounded Box',
  sphere: 'Sphere',
  capsule: 'Capsule',
  cylinder: 'Cylinder',
  cone: 'Cone',
  plane: 'Plane',
};

export function createDefaultGeometryParams(type: PrimitiveType): GeometryParams {
  switch (type) {
    case 'box':
      return { width: 1, height: 1, depth: 1 };
    case 'roundedBox':
      return { width: 1, height: 1, depth: 1, radius: 0.1, smoothness: 4 };
    case 'sphere':
      return { radius: 0.5, widthSegments: 32, heightSegments: 16 };
    case 'capsule':
      return { radius: 0.35, length: 0.8, capSegments: 8, radialSegments: 16 };
    case 'cylinder':
      return { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 24 };
    case 'cone':
      return { radius: 0.5, height: 1, radialSegments: 24 };
    case 'plane':
      return { width: 1, height: 1 };
  }
}

/** 새로 생성된 도형이 바닥(y=0)에 닿도록 중심 y좌표를 계산한다. */
export function getRestingYOffset(type: PrimitiveType, params: GeometryParams): number {
  switch (type) {
    case 'box':
    case 'roundedBox':
      return (params as BoxGeometryParams).height / 2;
    case 'sphere':
      return (params as SphereGeometryParams).radius;
    case 'capsule': {
      const p = params as CapsuleGeometryParams;
      return p.length / 2 + p.radius;
    }
    case 'cylinder':
    case 'cone':
      return (params as CylinderGeometryParams | ConeGeometryParams).height / 2;
    case 'plane':
      return 0;
  }
}
