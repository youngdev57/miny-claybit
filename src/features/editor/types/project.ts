import type { SceneObject } from '@/features/editor/types/scene';

export const PROJECT_FILE_VERSION = 2 as const;
const PROJECT_FILE_VERSION_V1 = 1 as const;

interface ProjectFileShape<TVersion extends number> {
  version: TVersion;
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

/** MVP 스키마(§20 이전). 저장된 객체에는 torus/lathe/modifiers가 없을 수 있다. */
export type ProjectFileV1 = ProjectFileShape<typeof PROJECT_FILE_VERSION_V1>;

/** Phase 2 스키마(PHASE2_SPEC §15). */
export type ProjectFile = ProjectFileShape<typeof PROJECT_FILE_VERSION>;

export { PROJECT_FILE_VERSION_V1 };
