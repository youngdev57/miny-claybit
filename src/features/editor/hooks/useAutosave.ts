import { useEffect, useRef } from 'react';

import { buildProjectFile } from '@/features/editor/services/projectImportExport';
import { loadAutosave, saveAutosave } from '@/features/editor/services/projectPersistence';
import { useEditorStore } from '@/stores/editorStore';

const AUTOSAVE_DEBOUNCE_MS = 800;

export function useAutosave() {
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const autosaved = loadAutosave();
    if (autosaved) {
      useEditorStore.getState().loadProjectFile(autosaved);
    }
  }, []);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = useEditorStore.subscribe((state, previousState) => {
      const changed =
        state.objects !== previousState.objects ||
        state.rootObjectIds !== previousState.rootObjectIds ||
        state.project !== previousState.project;

      if (!changed) return;

      useEditorStore.getState().setAutosaveStatus('saving');

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const { objects, rootObjectIds, selectedObjectId, project, setAutosaveStatus } = useEditorStore.getState();
        try {
          const file = buildProjectFile({ objects, rootObjectIds, selectedObjectId, project });
          saveAutosave(file);
          setAutosaveStatus('saved', new Date().toISOString());
        } catch {
          setAutosaveStatus('error');
        }
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      unsubscribe();
    };
  }, []);
}
