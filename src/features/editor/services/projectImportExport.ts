import { PROJECT_FILE_VERSION, PROJECT_FILE_VERSION_V1, type ProjectFile, type ProjectFileV1 } from '@/features/editor/types/project';
import type { ObjectModifiers, SceneObject } from '@/features/editor/types/scene';

interface ProjectFileSource {
  objects: SceneObject[];
  rootObjectIds: string[];
  selectedObjectId: string | null;
  project: { id: string; name: string; createdAt: string };
}

export function buildProjectFile(source: ProjectFileSource): ProjectFile {
  return {
    version: PROJECT_FILE_VERSION,
    project: {
      id: source.project.id,
      name: source.project.name,
      unit: 'meter',
      createdAt: source.project.createdAt,
      updatedAt: new Date().toISOString(),
    },
    scene: {
      objects: source.objects,
      rootObjectIds: source.rootObjectIds,
    },
    editor: {
      selectedObjectId: source.selectedObjectId,
      cameraMode: 'perspective',
      gridVisible: true,
      axisVisible: true,
    },
  };
}

function isSceneObject(value: unknown): value is SceneObject {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.visible === 'boolean' &&
    Array.isArray(candidate.position) &&
    Array.isArray(candidate.rotation) &&
    Array.isArray(candidate.scale)
  );
}

/** 버전(1 또는 2)과 무관한 공통 파일 구조만 검증한다. 세부 마이그레이션은 ensureCurrentVersion이 담당한다. */
export function isProjectFile(value: unknown): value is ProjectFileV1 | ProjectFile {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== PROJECT_FILE_VERSION_V1 && candidate.version !== PROJECT_FILE_VERSION) return false;

  const project = candidate.project as Record<string, unknown> | undefined;
  if (!project || typeof project.id !== 'string' || typeof project.name !== 'string') return false;

  const scene = candidate.scene as Record<string, unknown> | undefined;
  if (!scene || !Array.isArray(scene.objects) || !Array.isArray(scene.rootObjectIds)) return false;
  if (!scene.objects.every(isSceneObject)) return false;

  const editor = candidate.editor as Record<string, unknown> | undefined;
  if (!editor || (editor.selectedObjectId !== null && typeof editor.selectedObjectId !== 'string')) return false;

  return true;
}

const DEFAULT_MODIFIERS: ObjectModifiers = { taper: null, bend: null };

/** MVP(v1) 저장 당시 존재하지 않았던 modifiers 필드를 보정한다. geometryParams는 v1 도형 타입이
 * 이미 완전한 형태로 저장되어 있어 별도 구조 변경이 필요 없다. */
function normalizeObject(object: SceneObject): SceneObject {
  return { ...object, modifiers: object.modifiers ?? DEFAULT_MODIFIERS };
}

/** PHASE2_SPEC §15.2. v1 프로젝트를 v2 스키마로 승격한다. */
function migrateProjectV1ToV2(project: ProjectFileV1): ProjectFile {
  return {
    ...project,
    version: PROJECT_FILE_VERSION,
    scene: {
      ...project.scene,
      objects: project.scene.objects.map(normalizeObject),
    },
  };
}

/** 어떤 버전으로 저장되었든 현재 스키마(v2)로 정규화한다. 이미 v2인 파일도 modifiers 누락을 방어적으로 보정한다. */
export function ensureCurrentVersion(file: ProjectFileV1 | ProjectFile): ProjectFile {
  if (file.version === PROJECT_FILE_VERSION_V1) {
    return migrateProjectV1ToV2(file);
  }
  return { ...file, scene: { ...file.scene, objects: file.scene.objects.map(normalizeObject) } };
}

export function serializeProjectFile(file: ProjectFile): string {
  return JSON.stringify(file, null, 2);
}

export function downloadProjectFile(file: ProjectFile): void {
  const json = serializeProjectFile(file);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeName = file.project.name.trim() || 'untitled';
  anchor.href = url;
  anchor.download = `${safeName}.project.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function parseProjectFile(file: File): Promise<ProjectFile> {
  const text = await file.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('올바른 JSON 파일이 아닙니다.');
  }

  if (!isProjectFile(data)) {
    throw new Error('프로젝트 파일 형식이 올바르지 않거나 지원하지 않는 버전입니다.');
  }

  return ensureCurrentVersion(data);
}
