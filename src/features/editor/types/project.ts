import type { SceneObject } from '@/features/editor/types/scene';

export const PROJECT_FILE_VERSION = 1 as const;

export interface ProjectFile {
  version: typeof PROJECT_FILE_VERSION;
  project: {
    id: string;
    name: string;
    unit: 'meter';
    createdAt: string;
    updatedAt: string;
  };
  scene: {
    objects: SceneObject[];
    rootObjectIds: string[];
  };
  editor: {
    selectedObjectId: string | null;
    cameraMode: 'perspective' | 'orthographic';
    gridVisible: boolean;
    axisVisible: boolean;
  };
}
