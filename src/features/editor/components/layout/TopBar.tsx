import { useRef, useState } from 'react';

import ShortcutsDialog from '@/features/editor/components/layout/ShortcutsDialog';
import { buildExportScene, downloadGlb, exportSceneToGlbBinary, validateForExport } from '@/features/editor/services/glbExporter';
import { buildProjectFile, downloadProjectFile, parseProjectFile } from '@/features/editor/services/projectImportExport';
import type { ProjectFile } from '@/features/editor/types/project';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { useEditorStore } from '@/stores/editorStore';

type PendingAction =
  | { kind: 'new' }
  | { kind: 'import'; file: ProjectFile }
  | { kind: 'export-warning'; warnings: string[] };

function TopBar() {
  const objects = useEditorStore((state) => state.objects);
  const project = useEditorStore((state) => state.project);
  const pastLength = useEditorStore((state) => state.past.length);
  const futureLength = useEditorStore((state) => state.future.length);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const newProject = useEditorStore((state) => state.newProject);
  const loadProjectFile = useEditorStore((state) => state.loadProjectFile);
  const renameProject = useEditorStore((state) => state.renameProject);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [centerXZ, setCenterXZ] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleNewProject = () => {
    if (objects.length > 0) {
      setPendingAction({ kind: 'new' });
    } else {
      newProject();
    }
  };

  const handleSave = () => {
    const file = buildProjectFile({
      objects,
      rootObjectIds: useEditorStore.getState().rootObjectIds,
      selectedObjectId,
      project,
    });
    downloadProjectFile(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const parsed = await parseProjectFile(file);
      setErrorMessage(null);
      if (objects.length > 0) {
        setPendingAction({ kind: 'import', file: parsed });
      } else {
        loadProjectFile(parsed);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '프로젝트 파일을 불러오지 못했습니다.');
    }
  };

  const runExport = () => {
    try {
      const rootObjectIds = useEditorStore.getState().rootObjectIds;
      const { scene, dispose } = buildExportScene(objects, rootObjectIds, { centerXZ });
      exportSceneToGlbBinary(scene)
        .then((buffer) => {
          setErrorMessage(null);
          downloadGlb(buffer, project.name);
        })
        .catch((error) => {
          setErrorMessage(error instanceof Error ? error.message : 'GLB 내보내기에 실패했습니다.');
        })
        .finally(() => dispose());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'GLB 내보내기 준비 중 오류가 발생했습니다.');
    }
  };

  const handleExportGlb = () => {
    const { errors, warnings } = validateForExport(objects);
    if (errors.length > 0) {
      setErrorMessage(errors[0]);
      return;
    }
    setErrorMessage(null);
    if (warnings.length > 0) {
      setPendingAction({ kind: 'export-warning', warnings });
      return;
    }
    runExport();
  };

  const confirmPendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.kind === 'new') newProject();
    if (pendingAction.kind === 'import') loadProjectFile(pendingAction.file);
    if (pendingAction.kind === 'export-warning') runExport();
    setPendingAction(null);
  };

  const dialogContent = (() => {
    if (pendingAction?.kind === 'new') {
      return {
        title: '새 프로젝트를 시작할까요?',
        description: '저장하지 않은 현재 작업 내용은 사라집니다.',
        confirmLabel: '새로 시작',
      };
    }
    if (pendingAction?.kind === 'import') {
      return {
        title: '프로젝트를 불러올까요?',
        description: '저장하지 않은 현재 작업 내용은 사라집니다.',
        confirmLabel: '덮어쓰고 불러오기',
      };
    }
    if (pendingAction?.kind === 'export-warning') {
      return {
        title: '경고가 있습니다. 계속 내보낼까요?',
        description: pendingAction.warnings.join('\n'),
        confirmLabel: '계속 내보내기',
      };
    }
    return { title: '', description: '', confirmLabel: '확인' };
  })();

  return (
    <header className="flex items-center gap-2 border-b border-slate-200 bg-white/80 px-4 py-2">
      <input
        value={project.name}
        onChange={(event) => renameProject(event.target.value)}
        className="mr-2 w-40 rounded-md border border-transparent px-2 py-1 text-sm font-semibold text-ink hover:border-slate-200 focus:border-signal focus:outline-none"
      />

      <button
        type="button"
        onClick={handleNewProject}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-ink hover:border-signal hover:text-signal"
      >
        새 프로젝트
      </button>
      <button
        type="button"
        onClick={handleSave}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-ink hover:border-signal hover:text-signal"
      >
        JSON 저장
      </button>
      <button
        type="button"
        onClick={handleImportClick}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-ink hover:border-signal hover:text-signal"
      >
        JSON 불러오기
      </button>
      <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFileSelected} />

      <div className="mx-2 h-5 w-px bg-slate-200" />

      <button
        type="button"
        onClick={undo}
        disabled={pastLength === 0}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-ink hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-40"
      >
        실행 취소
      </button>
      <button
        type="button"
        onClick={redo}
        disabled={futureLength === 0}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-ink hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-40"
      >
        다시 실행
      </button>

      <div className="mx-2 h-5 w-px bg-slate-200" />

      <button
        type="button"
        onClick={handleExportGlb}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-ink hover:border-signal hover:text-signal"
      >
        GLB 내보내기
      </button>
      <label className="flex items-center gap-1 text-xs text-slate-500">
        <input type="checkbox" checked={centerXZ} onChange={(event) => setCenterXZ(event.target.checked)} />
        중심 맞추기(X/Z)
      </label>

      {errorMessage && (
        <p className="ml-2 max-w-xs truncate text-xs text-red-500" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={() => setShortcutsOpen(true)}
        className="ml-auto shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-ink hover:border-signal hover:text-signal"
      >
        단축키 안내
      </button>

      <ConfirmDialog
        open={pendingAction !== null}
        title={dialogContent.title}
        description={dialogContent.description}
        confirmLabel={dialogContent.confirmLabel}
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </header>
  );
}

export default TopBar;
