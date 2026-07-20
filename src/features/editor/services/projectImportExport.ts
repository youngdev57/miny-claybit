import { PROJECT_FILE_VERSION, type ProjectFile } from '@/features/editor/types/project';
import type { SceneObject } from '@/features/editor/types/scene';

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

export function isProjectFile(value: unknown): value is ProjectFile {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== PROJECT_FILE_VERSION) return false;

  const project = candidate.project as Record<string, unknown> | undefined;
  if (!project || typeof project.id !== 'string' || typeof project.name !== 'string') return false;

  const scene = candidate.scene as Record<string, unknown> | undefined;
  if (!scene || !Array.isArray(scene.objects) || !Array.isArray(scene.rootObjectIds)) return false;
  if (!scene.objects.every(isSceneObject)) return false;

  const editor = candidate.editor as Record<string, unknown> | undefined;
  if (!editor || (editor.selectedObjectId !== null && typeof editor.selectedObjectId !== 'string')) return false;

  return true;
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

  return data;
}
