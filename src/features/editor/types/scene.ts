import type { MaterialState } from '@/features/editor/types/material';

export type PrimitiveType =
  | 'box'
  | 'roundedBox'
  | 'sphere'
  | 'capsule'
  | 'cylinder'
  | 'cone'
  | 'plane'
  | 'torus'
  | 'lathe';

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

export interface TorusGeometryParams {
  radius: number;
  tube: number;
  radialSegments: number;
  tubularSegments: number;
  arc: number;
}

export interface LatheProfilePoint {
  y: number;
  radius: number;
}

export interface LatheGeometryParams {
  profile: LatheProfilePoint[];
  segments: number;
  phiStart: number;
  phiLength: number;
}

export type GeometryParams =
  | BoxGeometryParams
  | RoundedBoxGeometryParams
  | SphereGeometryParams
  | CapsuleGeometryParams
  | CylinderGeometryParams
  | ConeGeometryParams
  | PlaneGeometryParams
  | TorusGeometryParams
  | LatheGeometryParams;

export type NodeType = PrimitiveType | 'group';

/** 위/아래 굵기를 다르게 만드는 모디파이어(§8). Y가 낮을수록 bottomScale, 높을수록 topScale로 보간한다. */
export interface TaperModifier {
  enabled: boolean;
  topScale: number;
  bottomScale: number;
}

/** 직선형 도형을 구부리는 모디파이어(§9). start/end는 로컬 Y 범위를 0~1로 정규화한 값이다. */
export interface BendModifier {
  enabled: boolean;
  axis: 'x' | 'z';
  angle: number;
  start: number;
  end: number;
}

export interface ObjectModifiers {
  taper: TaperModifier | null;
  bend: BendModifier | null;
}

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
  /** group 타입도 형식상 갖지만 렌더링에는 영향을 주지 않는다. */
  modifiers: ObjectModifiers;
  createdAt: string;
  updatedAt: string;
}
