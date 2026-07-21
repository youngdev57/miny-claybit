import { Box3, Euler, Matrix4, Quaternion, Vector3 } from 'three';

import { applyModifiers } from '@/features/editor/geometry/modifiers';
import { createGeometryInstance } from '@/features/editor/geometry/primitiveFactory';
import type {
  BoxGeometryParams,
  CapsuleGeometryParams,
  ConeGeometryParams,
  CylinderGeometryParams,
  GeometryParams,
  LatheGeometryParams,
  ObjectModifiers,
  PlaneGeometryParams,
  PrimitiveType,
  RoundedBoxGeometryParams,
  SceneObject,
  SphereGeometryParams,
  TorusGeometryParams,
  Vec3,
} from '@/features/editor/types/scene';

interface LocalBounds {
  min: Vec3;
  max: Vec3;
}

function hasActiveModifier(modifiers?: ObjectModifiers | null): boolean {
  return Boolean(modifiers && (modifiers.taper?.enabled || modifiers.bend?.enabled));
}

/**
 * 도형의 로컬 공간 Bounding Box(min/max, meter)를 계산한다. 대부분의 기본 도형은 로컬 원점에
 * 대칭이지만 Lathe는 바닥(y=0)에서 시작하므로 대칭 가정 없이 실제 min/max를 그대로 반환해야 한다.
 * 테이퍼/휘어짐이 활성화된 객체는 분석적 공식으로 근사할 수 없으므로 실제 BufferGeometry를
 * 만들어 modifiers까지 적용한 뒤 계산한 bounding box를 사용한다.
 */
function getLocalBounds(type: PrimitiveType, params: GeometryParams, modifiers?: ObjectModifiers | null): LocalBounds {
  if (hasActiveModifier(modifiers)) {
    const geometry = createGeometryInstance(type, params);
    applyModifiers(geometry, modifiers);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    const bounds: LocalBounds = box
      ? { min: [box.min.x, box.min.y, box.min.z], max: [box.max.x, box.max.y, box.max.z] }
      : { min: [0, 0, 0], max: [0, 0, 0] };
    geometry.dispose();
    return bounds;
  }

  switch (type) {
    case 'box':
    case 'roundedBox': {
      const p = params as BoxGeometryParams | RoundedBoxGeometryParams;
      return { min: [-p.width / 2, -p.height / 2, -p.depth / 2], max: [p.width / 2, p.height / 2, p.depth / 2] };
    }
    case 'sphere': {
      const p = params as SphereGeometryParams;
      return { min: [-p.radius, -p.radius, -p.radius], max: [p.radius, p.radius, p.radius] };
    }
    case 'capsule': {
      const p = params as CapsuleGeometryParams;
      const halfHeight = p.length / 2 + p.radius;
      return { min: [-p.radius, -halfHeight, -p.radius], max: [p.radius, halfHeight, p.radius] };
    }
    case 'cylinder': {
      const p = params as CylinderGeometryParams;
      const r = Math.max(p.radiusTop, p.radiusBottom);
      return { min: [-r, -p.height / 2, -r], max: [r, p.height / 2, r] };
    }
    case 'cone': {
      const p = params as ConeGeometryParams;
      return { min: [-p.radius, -p.height / 2, -p.radius], max: [p.radius, p.height / 2, p.radius] };
    }
    case 'plane': {
      const p = params as PlaneGeometryParams;
      return { min: [-p.width / 2, -p.height / 2, 0], max: [p.width / 2, p.height / 2, 0] };
    }
    case 'torus': {
      const p = params as TorusGeometryParams;
      const r = p.radius + p.tube;
      return { min: [-r, -p.tube, -r], max: [r, p.tube, r] };
    }
    case 'lathe': {
      const p = params as LatheGeometryParams;
      const maxRadius = p.profile.reduce((max, point) => Math.max(max, point.radius), 0);
      const minY = p.profile.reduce((min, point) => Math.min(min, point.y), Infinity);
      const maxY = p.profile.reduce((max, point) => Math.max(max, point.y), -Infinity);
      return { min: [-maxRadius, minY, -maxRadius], max: [maxRadius, maxY, maxRadius] };
    }
  }
}

/** 스케일 적용 전, 도형 자체의 로컬 크기(width/height/depth, meter)를 계산한다. */
export function getLocalDimensions(type: PrimitiveType, params: GeometryParams, modifiers?: ObjectModifiers | null): Vec3 {
  const { min, max } = getLocalBounds(type, params, modifiers);
  return [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
}

/** 스케일이 반영된 객체의 실제 크기(월드 유닛=meter)를 계산한다. group에는 geometry가 없으므로 0을 반환한다. */
export function getWorldDimensions(object: SceneObject): Vec3 {
  if (object.type === 'group' || !object.geometryParams) return [0, 0, 0];
  const [width, height, depth] = getLocalDimensions(object.type, object.geometryParams, object.modifiers);
  return [width * object.scale[0], height * object.scale[1], depth * object.scale[2]];
}

function toLocalMatrix(transform: Pick<SceneObject, 'position' | 'rotation' | 'scale'>): Matrix4 {
  const quaternion = new Quaternion().setFromEuler(new Euler(...transform.rotation));
  return new Matrix4().compose(new Vector3(...transform.position), quaternion, new Vector3(...transform.scale));
}

function getWorldMatrix(object: SceneObject, objectsById: Map<string, SceneObject>): Matrix4 {
  const matrix = toLocalMatrix(object);
  const parent = object.parentId ? objectsById.get(object.parentId) : undefined;
  return parent ? getWorldMatrix(parent, objectsById).multiply(matrix) : matrix;
}

function isVisibleChain(object: SceneObject, objectsById: Map<string, SceneObject>): boolean {
  if (!object.visible) return false;
  const parent = object.parentId ? objectsById.get(object.parentId) : undefined;
  return parent ? isVisibleChain(parent, objectsById) : true;
}

interface BoundingBoxOptions {
  /** 숨김 처리된(또는 숨겨진 조상을 가진) 객체를 제외한다. */
  visibleOnly?: boolean;
  /** 지정하면 이 id 목록에 해당하는 객체만 계산에 포함한다. */
  onlyIds?: string[];
}

/** 지정된 객체들의 월드 공간 Bounding Box를 계산한다. group 자체는 geometry가 없으므로 제외한다. */
export function computeSceneBoundingBox(objects: SceneObject[], options: BoundingBoxOptions = {}): Box3 | null {
  const objectsById = new Map(objects.map((object) => [object.id, object]));
  const onlyIdSet = options.onlyIds ? new Set(options.onlyIds) : null;
  const box = new Box3();
  let hasContent = false;

  objects.forEach((object) => {
    if (object.type === 'group' || !object.geometryParams) return;
    if (onlyIdSet && !onlyIdSet.has(object.id)) return;
    if (options.visibleOnly && !isVisibleChain(object, objectsById)) return;

    const { min, max } = getLocalBounds(object.type, object.geometryParams, object.modifiers);
    const worldMatrix = getWorldMatrix(object, objectsById);

    for (const x of [min[0], max[0]]) {
      for (const y of [min[1], max[1]]) {
        for (const z of [min[2], max[2]]) {
          const corner = new Vector3(x, y, z).applyMatrix4(worldMatrix);
          box.expandByPoint(corner);
          hasContent = true;
        }
      }
    }
  });

  return hasContent ? box : null;
}
