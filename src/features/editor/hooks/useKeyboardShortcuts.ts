import { useEffect } from 'react';

import { useEditorStore } from '@/stores/editorStore';

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTypingInField(): boolean {
  const tag = document.activeElement?.tagName;
  return tag ? EDITABLE_TAGS.has(tag) : false;
}

export function useKeyboardShortcuts() {
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const setTransformMode = useEditorStore((state) => state.setTransformMode);
  const deleteObject = useEditorStore((state) => state.deleteObject);
  const duplicateObject = useEditorStore((state) => state.duplicateObject);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingInField()) return;

      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'd') {
        if (selectedObjectId) {
          event.preventDefault();
          duplicateObject(selectedObjectId);
        }
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'w':
          setTransformMode('translate');
          break;
        case 'e':
          setTransformMode('rotate');
          break;
        case 'r':
          setTransformMode('scale');
          break;
        case 'delete':
          if (selectedObjectId) deleteObject(selectedObjectId);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, setTransformMode, deleteObject, duplicateObject, undo, redo]);
}
