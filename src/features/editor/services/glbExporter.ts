import { Group, Mesh, MeshStandardMaterial, type Object3D, Scene, Vector3 } from 'three';
import { GLTFExporter } from 'three-stdlib';

import { createGeometryInstance } from '@/features/editor/geometry/primitiveFactory';
import { createThreeMaterial } from '@/features/editor/materials/materialFactory';
import { computeSceneBoundingBox } from '@/features/editor/utils/bounds';
import type { SceneObject } from '@/features/editor/types/scene';

export const MAX_RECOMMENDED_OBJECTS = 100;
export const MAX_OBJECTS = 200;
const MAX_RECOMMENDED_DIMENSION_METERS = 50;

export interface ExportValidation {
  errors: string[];
  warnings: string[];
}

/** GLB 내보내기 전 검사: 표시 중인 객체 유무, NaN/Infinity, 투명도 범위는 에러(내보내기 차단),
 * 객체 수 초과·모델 크기 과대는 경고(사용자 확인 후 진행 가능)로 구분한다. */
export function validateForExport(objects: SceneObject[]): ExportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const exportable = objects.filter((object) => object.visible && object.type !== 'group');

  if (exportable.length === 0) {
    errors.push('내보낼 표시 중인 객체가 없습니다.');
  }

  exportable.forEach((object) => {
    if (!object.geometryParams) {
      errors.push(`${object.name}: geometry 정보가 없습니다.`);
      return;
    }

    const transformValues = [...object.position, ...object.rotation, ...object.scale];
    if (transformValues.some((value) => !Number.isFinite(value))) {
      errors.push(`${object.name}: 위치/회전/크기 값에 NaN 또는 Infinity가 있습니다.`);
    }

    if (object.material) {
      const { opacity } = object.material;
      if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
        errors.push(`${object.name}: 투명도(opacity) 값이 0~1 범위를 벗어났습니다.`);
      }
    }
  });

  if (objects.length > MAX_OBJECTS) {
    warnings.push(`객체 수(${objects.length}개)가 최대 권장치(${MAX_OBJECTS}개)를 초과했습니다.`);
  } else if (objects.length > MAX_RECOMMENDED_OBJECTS) {
    warnings.push(`객체 수(${objects.length}개)가 권장치(${MAX_RECOMMENDED_OBJECTS}개)를 초과했습니다.`);
  }

  const box = computeSceneBoundingBox(objects, { visibleOnly: true });
  if (box) {
    const size = new Vector3();
    box.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z);
    if (maxDimension > MAX_RECOMMENDED_DIMENSION_METERS) {
      warnings.push(`모델 크기가 ${maxDimension.toFixed(1)}m로 매우 큽니다. 단위를 확인하세요.`);
    }
  }

  return { errors, warnings };
}

export interface GlbExportOptions {
  /** 전체 중심을 X=0, Z=0에 맞출지 여부. */
  centerXZ: boolean;
}

function buildObject3D(object: SceneObject): Object3D {
  const node: Object3D = object.type === 'group' ? new Group() : new Mesh();
  node.name = object.name;
  node.position.set(...object.position);
  node.rotation.set(...object.rotation);
  node.scale.set(...object.scale);

  if (node instanceof Mesh && object.type !== 'group' && object.geometryParams) {
    node.geometry = createGeometryInstance(object.type, object.geometryParams);
    node.material = object.material ? createThreeMaterial(object.material) : new MeshStandardMaterial();
  }

  return node;
}

interface BuiltExportScene {
  scene: Scene;
  /** 내보내기 전용으로 생성한 geometry/material 리소스를 해제한다. */
  dispose: () => void;
}

/** 숨긴 객체 제외, 그룹 계층 유지, 바닥 Y=0 스냅(항상 적용), 선택적 X/Z 중심 정렬을 적용한 내보내기용 Scene을 만든다. */
export function buildExportScene(
  objects: SceneObject[],
  rootObjectIds: string[],
  options: GlbExportOptions,
): BuiltExportScene {
  const exportable = objects.filter((object) => object.visible);
  const exportableIds = new Set(exportable.map((object) => object.id));
  const nodesById = new Map<string, Object3D>();
  const createdMeshes: Mesh[] = [];

  exportable.forEach((object) => {
    const node = buildObject3D(object);
    if (node instanceof Mesh) createdMeshes.push(node);
    nodesById.set(object.id, node);
  });

  exportable.forEach((object) => {
    if (!object.parentId || !exportableIds.has(object.parentId)) return;
    const parentNode = nodesById.get(object.parentId);
    const childNode = nodesById.get(object.id);
    if (parentNode && childNode) parentNode.add(childNode);
  });

  const offset = new Vector3(0, 0, 0);
  const box = computeSceneBoundingBox(objects, { visibleOnly: true });
  if (box) {
    offset.y = -box.min.y;
    if (options.centerXZ) {
      const center = new Vector3();
      box.getCenter(center);
      offset.x = -center.x;
      offset.z = -center.z;
    }
  }

  const rootGroup = new Group();
  rootGroup.name = 'Scene';
  rootGroup.position.copy(offset);

  rootObjectIds.forEach((id) => {
    if (!exportableIds.has(id)) return;
    const node = nodesById.get(id);
    if (node) rootGroup.add(node);
  });

  const scene = new Scene();
  scene.add(rootGroup);

  const dispose = () => {
    createdMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      if (mesh.material instanceof MeshStandardMaterial) mesh.material.dispose();
    });
  };

  return { scene, dispose };
}

export function exportSceneToGlbBinary(scene: Scene): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) resolve(result);
        else reject(new Error('GLB 바이너리 생성에 실패했습니다.'));
      },
      (error) => reject(error instanceof Error ? error : new Error('GLB 내보내기 중 오류가 발생했습니다.')),
      { binary: true },
    );
  });
}

export function downloadGlb(buffer: ArrayBuffer, projectName: string): void {
  const blob = new Blob([buffer], { type: 'model/gltf-binary' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeName = projectName.trim() || 'untitled';
  anchor.href = url;
  anchor.download = `${safeName}.glb`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
