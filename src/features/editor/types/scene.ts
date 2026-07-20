import type { MaterialState } from '@/features/editor/types/material';

export type PrimitiveType = 'box' | 'roundedBox' | 'sphere' | 'capsule' | 'cylinder' | 'cone' | 'plane';

export type Vec3 = [number, number, number];

export interface BoxGeometryParams {
  width: number;
  height: number;
  depth: number;
}

export interface RoundedBoxGeometryParams {
  width: number;
  height: number;
  depth: number;
  radius: number;
  smoothness: number;
}

export interface SphereGeometryParams {
  radius: number;
  widthSegments: number;
  heightSegments: number;
}

export interface CapsuleGeometryParams {
  radius: number;
  length: number;
  capSegments: number;
  radialSegments: number;
}

export interface CylinderGeometryParams {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments: number;
}

export interface ConeGeometryParams {
  radius: number;
  height: number;
  radialSegments: number;
}

export interface PlaneGeometryParams {
  width: number;
  height: number;
}

export type GeometryParams =
  | BoxGeometryParams
  | RoundedBoxGeometryParams
  | SphereGeometryParams
  | CapsuleGeometryParams
  | CylinderGeometryParams
  | ConeGeometryParams
  | PlaneGeometryParams;

export type NodeType = PrimitiveType | 'group';

export interface SceneObject {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  visible: boolean;
  locked: boolean;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  /** group 타입은 렌더링할 geometry가 없으므로 primitive에서만 존재한다. */
  geometryParams?: GeometryParams;
  /** group 타입은 재질을 갖지 않는다. */
  material?: MaterialState;
  createdAt: string;
  updatedAt: string;
}
