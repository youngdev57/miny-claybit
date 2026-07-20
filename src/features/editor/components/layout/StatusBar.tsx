import { MAX_OBJECTS, MAX_RECOMMENDED_OBJECTS } from '@/features/editor/services/glbExporter';
import type { AutosaveStatus } from '@/stores/editorStore';
import { useEditorStore } from '@/stores/editorStore';

const STATUS_LABELS: Record<AutosaveStatus, string> = {
  idle: '자동 저장 대기 중',
  saving: '저장 중...',
  saved: '저장됨',
  error: '저장 실패',
};

function formatTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('ko-KR', { hour12: false });
}

function StatusBar() {
  const objects = useEditorStore((state) => state.objects);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const autosaveStatus = useEditorStore((state) => state.autosaveStatus);
  const lastSavedAt = useEditorStore((state) => state.lastSavedAt);

  const selectedObject = objects.find((object) => object.id === selectedObjectId);
  const statusLabel = STATUS_LABELS[autosaveStatus];
  const statusColor = autosaveStatus === 'error' ? 'text-red-500' : 'text-slate-400';

  const objectCountColor = objects.length > MAX_OBJECTS ? 'text-red-500' : objects.length > MAX_RECOMMENDED_OBJECTS ? 'text-orange-500' : '';
  const objectCountWarning =
    objects.length > MAX_OBJECTS
      ? ` (최대 ${MAX_OBJECTS}개 초과)`
      : objects.length > MAX_RECOMMENDED_OBJECTS
        ? ` (권장 ${MAX_RECOMMENDED_OBJECTS}개 초과)`
        : '';

  return (
    <footer className="flex items-center gap-4 border-t border-slate-200 bg-white/80 px-4 py-1.5 text-xs text-slate-500">
      <span className={objectCountColor}>
        객체 수: {objects.length}
        {objectCountWarning}
      </span>
      <span>선택 객체: {selectedObject ? selectedObject.name : '없음'}</span>
      <span>단위: m</span>
      <span className={`ml-auto ${statusColor}`}>
        {statusLabel}
        {autosaveStatus === 'saved' && lastSavedAt ? ` (${formatTime(lastSavedAt)})` : ''}
      </span>
    </footer>
  );
}

export default StatusBar;
