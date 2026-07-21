import { ensureCurrentVersion, isProjectFile } from '@/features/editor/services/projectImportExport';
import type { ProjectFile } from '@/features/editor/types/project';

const AUTOSAVE_STORAGE_KEY = 'miny-claybit.autosave.v1';

export function saveAutosave(file: ProjectFile): void {
  localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(file));
}

export function loadAutosave(): ProjectFile | null {
  const raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
  if (!raw) return null;

  try {
    const data: unknown = JSON.parse(raw);
    return isProjectFile(data) ? ensureCurrentVersion(data) : null;
  } catch {
    return null;
  }
}

export function clearAutosave(): void {
  localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
}
