import { DEFAULT_POTION_PROFILE } from '@/features/editor/geometry/latheProfile';
import { ko } from '@/i18n/ko';
import type {
  BoxGeometryParams,
  CapsuleGeometryParams,
  ConeGeometryParams,
  CylinderGeometryParams,
  GeometryParams,
  PrimitiveType,
  SphereGeometryParams,
  TorusGeometryParams,
} from '@/features/editor/types/scene';

export const PRIMITIVE_TYPES: PrimitiveType[] = [
  'box',
  'roundedBox',
  'sphere',
  'capsule',
  'cylinder',
  'cone',
  'plane',
  'torus',
  'lathe',
];

export const PRIMITIVE_LABELS: Record<PrimitiveType, string> = ko.primitive;

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
    case 'torus':
      return { radius: 0.35, tube: 0.08, radialSegments: 16, tubularSegments: 32, arc: Math.PI * 2 };
    case 'lathe':
      return { profile: DEFAULT_POTION_PROFILE.map((point) => ({ ...point })), segments: 32, phiStart: 0, phiLength: Math.PI * 2 };
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
    case 'torus':
      return (params as TorusGeometryParams).tube;
    case 'lathe':
      return 0; // 프로필의 첫 점이 항상 y=0으로 고정되어 바닥에 이미 닿아 있다.
  }
}

/** 도형 품질 프리셋: 저폴리/기본/부드러움 3단계로 세그먼트류 파라미터를 일괄 조절한다. */
export type GeometryQuality = 'low' | 'medium' | 'high';

export const GEOMETRY_QUALITY_LABELS: Record<GeometryQuality, string> = ko.geometry.quality;

export const GEOMETRY_QUALITY_PRESETS: Partial<Record<PrimitiveType, Record<GeometryQuality, Partial<GeometryParams>>>> = {
  sphere: {
    low: { widthSegments: 12, heightSegments: 8 },
    medium: { widthSegments: 32, heightSegments: 16 },
    high: { widthSegments: 64, heightSegments: 32 },
  },
  cylinder: {
    low: { radialSegments: 8 },
    medium: { radialSegments: 24 },
    high: { radialSegments: 64 },
  },
  cone: {
    low: { radialSegments: 8 },
    medium: { radialSegments: 24 },
    high: { radialSegments: 64 },
  },
  capsule: {
    low: { capSegments: 4, radialSegments: 8 },
    medium: { capSegments: 8, radialSegments: 16 },
    high: { capSegments: 16, radialSegments: 32 },
  },
  torus: {
    low: { radialSegments: 6, tubularSegments: 12 },
    medium: { radialSegments: 16, tubularSegments: 32 },
    high: { radialSegments: 24, tubularSegments: 64 },
  },
  roundedBox: {
    low: { smoothness: 2 },
    medium: { smoothness: 4 },
    high: { smoothness: 8 },
  },
  lathe: {
    low: { segments: 12 },
    medium: { segments: 32 },
    high: { segments: 96 },
  },
};

interface SegmentFieldSpec {
  key: string;
  label: string;
  min: number;
  max: number;
}

/** 형태 패널에서 직접 숫자로 노출할 세그먼트 필드 목록. 최대치는 PHASE2_SPEC §20.1 권장 상한을 따른다. */
export const GEOMETRY_SEGMENT_FIELDS: Partial<Record<PrimitiveType, SegmentFieldSpec[]>> = {
  sphere: [
    { key: 'widthSegments', label: ko.geometry.sphere.widthSegments, min: 3, max: 64 },
    { key: 'heightSegments', label: ko.geometry.sphere.heightSegments, min: 2, max: 32 },
  ],
  cylinder: [{ key: 'radialSegments', label: ko.geometry.cylinder.radialSegments, min: 3, max: 64 }],
  cone: [{ key: 'radialSegments', label: ko.geometry.cone.radialSegments, min: 3, max: 64 }],
  capsule: [
    { key: 'capSegments', label: ko.geometry.capsule.capSegments, min: 1, max: 32 },
    { key: 'radialSegments', label: ko.geometry.capsule.radialSegments, min: 3, max: 32 },
  ],
  torus: [
    { key: 'radialSegments', label: ko.geometry.torus.radialSegments, min: 3, max: 96 },
    { key: 'tubularSegments', label: ko.geometry.torus.tubularSegments, min: 3, max: 96 },
  ],
  lathe: [{ key: 'segments', label: ko.geometry.lathe.segments, min: 3, max: 96 }],
};

/** 테이퍼 우선 적용 대상(PHASE2_SPEC §8.2). Box/Rounded Box는 후속 적용으로 이번 단계에서는 제외한다. */
export const TAPER_APPLICABLE_TYPES: PrimitiveType[] = ['cylinder', 'cone', 'capsule'];

/** 휘어짐 적용 대상(PHASE2_SPEC §9.2). Torus는 명시적으로 제외된다. */
export const BEND_APPLICABLE_TYPES: PrimitiveType[] = ['cylinder', 'cone', 'capsule', 'lathe'];

/** 휘어짐 각도 권장 제한(PHASE2_SPEC §9.7). */
export const BEND_ANGLE_LIMIT_DEG = 120;
