import { create } from 'zustand';

import { createDefaultGeometryParams, getRestingYOffset, PRIMITIVE_LABELS } from '@/features/editor/geometry/geometryDefaults';
import type { ProjectFile } from '@/features/editor/types/project';
import { defaultMaterial, type MaterialState } from '@/features/editor/types/material';
import type { NodeType, PrimitiveType, SceneObject, Vec3 } from '@/features/editor/types/scene';
import { createId } from '@/features/editor/utils/ids';
import { fromReferenceLocal, toReferenceLocal } from '@/features/editor/utils/transformMath';

export type TransformMode = 'translate' | 'rotate' | 'scale';
export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type SizeUnit = 'meter' | 'centimeter';

export interface ProjectMeta {
  id: string;
  name: string;
  createdAt: string;
}

interface HistorySnapshot {
  objects: SceneObject[];
  rootObjectIds: string[];
  selectedObjectId: string | null;
}

const MAX_HISTORY_STEPS = 50;
const HISTORY_DEBOUNCE_MS = 500;

interface EditorState {
  objects: SceneObject[];
  rootObjectIds: string[];
  selectedObjectId: string | null;
  multiSelectedIds: string[];
  transformMode: TransformMode;
  scaleLocked: boolean;
  sizeUnit: SizeUnit;
  project: ProjectMeta;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  autosaveStatus: AutosaveStatus;
  lastSavedAt: string | null;
  addObject: (type: PrimitiveType, dropPosition?: Vec3) => void;
  updateObject: (id: string, changes: Partial<Pick<SceneObject, 'position' | 'rotation' | 'scale'>>) => void;
  updateMaterial: (id: string, changes: Partial<MaterialState>) => void;
  deleteObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  renameObject: (id: string, name: string) => void;
  toggleVisibility: (id: string) => void;
  mirrorObjectX: (id: string) => void;
  groupObjects: (ids: string[]) => void;
  ungroupObject: (id: string) => void;
  selectObject: (id: string) => void;
  toggleMultiSelect: (id: string) => void;
  clearSelection: () => void;
  setTransformMode: (mode: TransformMode) => void;
  toggleScaleLocked: () => void;
  setSizeUnit: (unit: SizeUnit) => void;
  undo: () => void;
  redo: () => void;
  renameProject: (name: string) => void;
  newProject: () => void;
  loadProjectFile: (file: ProjectFile) => void;
  setAutosaveStatus: (status: AutosaveStatus, savedAt?: string) => void;
}

function nextObjectName(type: NodeType, objects: SceneObject[]): string {
  const label = type === 'group' ? '그룹' : PRIMITIVE_LABELS[type];
  const existingCount = objects.filter((object) => object.type === type).length;
  return `${label} ${existingCount + 1}`;
}

function getDescendantIds(id: string, objects: SceneObject[]): string[] {
  const directChildren = objects.filter((object) => object.parentId === id);
  return directChildren.flatMap((child) => [child.id, ...getDescendantIds(child.id, objects)]);
}

function createDefaultProjectMeta(): ProjectMeta {
  return { id: createId(), name: '새 프로젝트', createdAt: new Date().toISOString() };
}

export const useEditorStore = create<EditorState>((set, get) => {
  let historyBurstTimer: ReturnType<typeof setTimeout> | null = null;

  const cancelHistoryBurst = () => {
    if (historyBurstTimer) {
      clearTimeout(historyBurstTimer);
      historyBurstTimer = null;
    }
  };

  const snapshotCurrent = (): HistorySnapshot =>
    structuredClone({
      objects: get().objects,
      rootObjectIds: get().rootObjectIds,
      selectedObjectId: get().selectedObjectId,
    });

  /** 생성/삭제/복제 등 단발성 사용자 액션 전에 호출하여 실행 취소 지점 하나를 즉시 기록한다. */
  const recordHistory = () => {
    cancelHistoryBurst();
    const state = get();
    const past = [...state.past, snapshotCurrent()].slice(-MAX_HISTORY_STEPS);
    set({ past, future: [] });
  };

  /** 드래그(TransformControls)나 연속 입력(슬라이더/숫자 입력) 중에는 매 프레임 기록하지 않고,
   * 연속 조작이 시작될 때 한 번만 기록한 뒤 debounce 동안 이어지는 변경은 건너뛴다. */
  const recordHistoryDebounced = () => {
    if (!historyBurstTimer) {
      const state = get();
      const past = [...state.past, snapshotCurrent()].slice(-MAX_HISTORY_STEPS);
      set({ past, future: [] });
    } else {
      clearTimeout(historyBurstTimer);
    }
    historyBurstTimer = setTimeout(() => {
      historyBurstTimer = null;
    }, HISTORY_DEBOUNCE_MS);
  };

  return {
    objects: [],
    rootObjectIds: [],
    selectedObjectId: null,
    multiSelectedIds: [],
    transformMode: 'translate',
    scaleLocked: false,
    sizeUnit: 'meter',
    project: createDefaultProjectMeta(),
    past: [],
    future: [],
    autosaveStatus: 'idle',
    lastSavedAt: null,

    addObject: (type, dropPosition = [0, 0, 0]) => {
      recordHistory();
      const geometryParams = createDefaultGeometryParams(type);
      const id = createId();
      const now = new Date().toISOString();

      const object: SceneObject = {
        id,
        name: nextObjectName(type, get().objects),
        type,
        parentId: null,
        visible: true,
        locked: false,
        position: [dropPosition[0], getRestingYOffset(type, geometryParams), dropPosition[2]],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryParams,
        material: { ...defaultMaterial },
        createdAt: now,
        updatedAt: now,
      };

      set((state) => ({
        objects: [...state.objects, object],
        rootObjectIds: [...state.rootObjectIds, id],
        selectedObjectId: id,
        multiSelectedIds: [id],
      }));
    },

    updateObject: (id, changes) => {
      recordHistoryDebounced();
      const now = new Date().toISOString();
      set((state) => ({
        objects: state.objects.map((object) =>
          object.id === id ? { ...object, ...changes, updatedAt: now } : object,
        ),
      }));
    },

    updateMaterial: (id, changes) => {
      recordHistoryDebounced();
      const now = new Date().toISOString();
      set((state) => ({
        objects: state.objects.map((object) =>
          object.id === id && object.material
            ? { ...object, material: { ...object.material, ...changes }, updatedAt: now }
            : object,
        ),
      }));
    },

    deleteObject: (id) => {
      recordHistory();
      set((state) => {
        const idsToRemove = new Set([id, ...getDescendantIds(id, state.objects)]);
        return {
          objects: state.objects.filter((object) => !idsToRemove.has(object.id)),
          rootObjectIds: state.rootObjectIds.filter((rootId) => !idsToRemove.has(rootId)),
          selectedObjectId: state.selectedObjectId && idsToRemove.has(state.selectedObjectId) ? null : state.selectedObjectId,
          multiSelectedIds: state.multiSelectedIds.filter((selectedId) => !idsToRemove.has(selectedId)),
        };
      });
    },

    duplicateObject: (id) => {
      recordHistory();
      const state = get();
      const source = state.objects.find((object) => object.id === id);
      if (!source) return;

      const subtreeIds = [id, ...getDescendantIds(id, state.objects)];
      const idMap = new Map(subtreeIds.map((subtreeId) => [subtreeId, createId()]));
      const now = new Date().toISOString();

      const clones: SceneObject[] = subtreeIds.map((subtreeId) => {
        const original = state.objects.find((object) => object.id === subtreeId)!;
        const newId = idMap.get(subtreeId)!;
        const isDuplicateRoot = subtreeId === id;

        return {
          ...original,
          id: newId,
          name: isDuplicateRoot ? nextObjectName(original.type, state.objects) : original.name,
          parentId: original.parentId && idMap.has(original.parentId) ? idMap.get(original.parentId)! : original.parentId,
          position: isDuplicateRoot
            ? [original.position[0] + 0.2, original.position[1], original.position[2]]
            : [...original.position],
          material: original.material ? { ...original.material } : undefined,
          createdAt: now,
          updatedAt: now,
        };
      });

      const newRootId = idMap.get(id)!;

      set((s) => ({
        objects: [...s.objects, ...clones],
        rootObjectIds: source.parentId ? s.rootObjectIds : [...s.rootObjectIds, newRootId],
        selectedObjectId: newRootId,
        multiSelectedIds: [newRootId],
      }));
    },

    renameObject: (id, name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      recordHistory();
      const now = new Date().toISOString();
      set((state) => ({
        objects: state.objects.map((object) => (object.id === id ? { ...object, name: trimmed, updatedAt: now } : object)),
      }));
    },

    toggleVisibility: (id) => {
      recordHistory();
      const now = new Date().toISOString();
      set((state) => ({
        objects: state.objects.map((object) =>
          object.id === id ? { ...object, visible: !object.visible, updatedAt: now } : object,
        ),
      }));
    },

    mirrorObjectX: (id) => {
      const state = get();
      const source = state.objects.find((object) => object.id === id);
      if (!source) return;

      recordHistory();
      const newId = createId();
      const now = new Date().toISOString();
      const mirrored: SceneObject = {
        ...source,
        id: newId,
        name: nextObjectName(source.type, state.objects),
        position: [-source.position[0], source.position[1], source.position[2]],
        rotation: [source.rotation[0], -source.rotation[1], -source.rotation[2]],
        scale: [...source.scale],
        material: source.material ? { ...source.material } : undefined,
        createdAt: now,
        updatedAt: now,
      };

      set((s) => ({
        objects: [...s.objects, mirrored],
        rootObjectIds: source.parentId ? s.rootObjectIds : [...s.rootObjectIds, newId],
        selectedObjectId: newId,
        multiSelectedIds: [newId],
      }));
    },

    groupObjects: (ids) => {
      const state = get();
      const uniqueIds = Array.from(new Set(ids));
      const targets = uniqueIds
        .map((targetId) => state.objects.find((object) => object.id === targetId))
        .filter((object): object is SceneObject => Boolean(object));
      if (targets.length < 2) return;

      const parentId = targets[0].parentId;
      const sameParent = targets.every((object) => object.parentId === parentId);
      if (!sameParent) return;

      recordHistory();

      const centroid: Vec3 = [
        targets.reduce((sum, object) => sum + object.position[0], 0) / targets.length,
        targets.reduce((sum, object) => sum + object.position[1], 0) / targets.length,
        targets.reduce((sum, object) => sum + object.position[2], 0) / targets.length,
      ];
      const groupTransform = { position: centroid, rotation: [0, 0, 0] as Vec3, scale: [1, 1, 1] as Vec3 };

      const groupId = createId();
      const now = new Date().toISOString();
      const groupObject: SceneObject = {
        id: groupId,
        name: nextObjectName('group', state.objects),
        type: 'group',
        parentId,
        visible: true,
        locked: false,
        position: groupTransform.position,
        rotation: groupTransform.rotation,
        scale: groupTransform.scale,
        createdAt: now,
        updatedAt: now,
      };

      const targetIdSet = new Set(targets.map((object) => object.id));

      set((s) => ({
        objects: [
          ...s.objects.map((object) => {
            if (!targetIdSet.has(object.id)) return object;
            const local = toReferenceLocal(
              { position: object.position, rotation: object.rotation, scale: object.scale },
              groupTransform,
            );
            return { ...object, parentId: groupId, ...local, updatedAt: now };
          }),
          groupObject,
        ],
        rootObjectIds: parentId
          ? s.rootObjectIds
          : [...s.rootObjectIds.filter((rootId) => !targetIdSet.has(rootId)), groupId],
        selectedObjectId: groupId,
        multiSelectedIds: [groupId],
      }));
    },

    ungroupObject: (id) => {
      const state = get();
      const group = state.objects.find((object) => object.id === id);
      if (!group || group.type !== 'group') return;

      recordHistory();

      const groupTransform = { position: group.position, rotation: group.rotation, scale: group.scale };
      const children = state.objects.filter((object) => object.parentId === id);
      const now = new Date().toISOString();

      set((s) => ({
        objects: s.objects
          .filter((object) => object.id !== id)
          .map((object) => {
            if (object.parentId !== id) return object;
            const restored = fromReferenceLocal(
              { position: object.position, rotation: object.rotation, scale: object.scale },
              groupTransform,
            );
            return { ...object, parentId: group.parentId, ...restored, updatedAt: now };
          }),
        rootObjectIds: group.parentId
          ? s.rootObjectIds
          : [...s.rootObjectIds.filter((rootId) => rootId !== id), ...children.map((child) => child.id)],
        selectedObjectId: null,
        multiSelectedIds: [],
      }));
    },

    selectObject: (id) => set({ selectedObjectId: id, multiSelectedIds: [id] }),

    toggleMultiSelect: (id) =>
      set((state) => {
        const exists = state.multiSelectedIds.includes(id);
        const multiSelectedIds = exists
          ? state.multiSelectedIds.filter((selectedId) => selectedId !== id)
          : [...state.multiSelectedIds, id];
        return { multiSelectedIds, selectedObjectId: id };
      }),

    clearSelection: () => set({ selectedObjectId: null, multiSelectedIds: [] }),

    setTransformMode: (mode) => set({ transformMode: mode }),

    toggleScaleLocked: () => set((state) => ({ scaleLocked: !state.scaleLocked })),

    setSizeUnit: (unit) => set({ sizeUnit: unit }),

    undo: () => {
      cancelHistoryBurst();
      const state = get();
      if (state.past.length === 0) return;
      const previous = state.past[state.past.length - 1];
      const current = snapshotCurrent();
      set({
        objects: previous.objects,
        rootObjectIds: previous.rootObjectIds,
        selectedObjectId: previous.selectedObjectId,
        multiSelectedIds: previous.selectedObjectId ? [previous.selectedObjectId] : [],
        past: state.past.slice(0, -1),
        future: [current, ...state.future],
      });
    },

    redo: () => {
      cancelHistoryBurst();
      const state = get();
      if (state.future.length === 0) return;
      const next = state.future[0];
      const current = snapshotCurrent();
      set({
        objects: next.objects,
        rootObjectIds: next.rootObjectIds,
        selectedObjectId: next.selectedObjectId,
        multiSelectedIds: next.selectedObjectId ? [next.selectedObjectId] : [],
        past: [...state.past, current],
        future: state.future.slice(1),
      });
    },

    renameProject: (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      set((state) => ({ project: { ...state.project, name: trimmed } }));
    },

    newProject: () => {
      cancelHistoryBurst();
      set({
        objects: [],
        rootObjectIds: [],
        selectedObjectId: null,
        multiSelectedIds: [],
        past: [],
        future: [],
        project: createDefaultProjectMeta(),
      });
    },

    loadProjectFile: (file) => {
      cancelHistoryBurst();
      set({
        objects: file.scene.objects,
        rootObjectIds: file.scene.rootObjectIds,
        selectedObjectId: file.editor.selectedObjectId,
        multiSelectedIds: file.editor.selectedObjectId ? [file.editor.selectedObjectId] : [],
        project: { id: file.project.id, name: file.project.name, createdAt: file.project.createdAt },
        past: [],
        future: [],
      });
    },

    setAutosaveStatus: (status, savedAt) =>
      set((state) => ({ autosaveStatus: status, lastSavedAt: savedAt ?? state.lastSavedAt })),
  };
});
