import { Box3, Euler, Matrix4, Quaternion, Vector3 } from 'three';

import type {
  BoxGeometryParams,
  CapsuleGeometryParams,
  ConeGeometryParams,
  CylinderGeometryParams,
  GeometryParams,
  PlaneGeometryParams,
  PrimitiveType,
  RoundedBoxGeometryParams,
  SceneObject,
  SphereGeometryParams,
  Vec3,
} from '@/features/editor/types/scene';

/** 스케일 적용 전, 도형 자체의 로컬 크기(width/height/depth, meter)를 계산한다. */
export function getLocalDimensions(type: PrimitiveType, params: GeometryParams): Vec3 {
  switch (type) {
    case 'box':
    case 'roundedBox': {
      const p = params as BoxGeometryParams | RoundedBoxGeometryParams;
      return [p.width, p.height, p.depth];
    }
    case 'sphere': {
      const p = params as SphereGeometryParams;
      return [p.radius * 2, p.radius * 2, p.radius * 2];
    }
    case 'capsule': {
      const p = params as CapsuleGeometryParams;
      return [p.radius * 2, p.length + p.radius * 2, p.radius * 2];
    }
    case 'cylinder': {
      const p = params as CylinderGeometryParams;
      const diameter = Math.max(p.radiusTop, p.radiusBottom) * 2;
      return [diameter, p.height, diameter];
    }
    case 'cone': {
      const p = params as ConeGeometryParams;
      return [p.radius * 2, p.height, p.radius * 2];
    }
    case 'plane': {
      const p = params as PlaneGeometryParams;
      return [p.width, p.height, 0];
    }
  }
}

/** 스케일이 반영된 객체의 실제 크기(월드 유닛=meter)를 계산한다. group에는 geometry가 없으므로 0을 반환한다. */
export function getWorldDimensions(object: SceneObject): Vec3 {
  if (object.type === 'group' || !object.geometryParams) return [0, 0, 0];
  const [width, height, depth] = getLocalDimensions(object.type, object.geometryParams);
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

    const [width, height, depth] = getLocalDimensions(object.type, object.geometryParams);
    const halfExtents = { x: width / 2, y: height / 2, z: depth / 2 };
    const worldMatrix = getWorldMatrix(object, objectsById);

    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const corner = new Vector3(halfExtents.x * sx, halfExtents.y * sy, halfExtents.z * sz).applyMatrix4(worldMatrix);
          box.expandByPoint(corner);
          hasContent = true;
        }
      }
    }
  });

  return hasContent ? box : null;
}
