const SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: 'W', description: '이동 모드' },
  { keys: 'E', description: '회전 모드' },
  { keys: 'R', description: '크기 조절 모드' },
  { keys: 'Delete', description: '선택 객체 삭제' },
  { keys: 'Ctrl + D', description: '선택 객체 복제' },
  { keys: 'Ctrl + Z', description: '실행 취소' },
  { keys: 'Ctrl + Shift + Z', description: '다시 실행' },
  { keys: 'Ctrl/Shift + 클릭', description: '객체 목록에서 다중 선택 (그룹화 대상 지정)' },
];

interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-96 rounded-lg bg-white p-5 shadow-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-3 text-sm font-semibold text-ink">키보드 단축키</h2>
        <table className="w-full text-sm">
          <tbody>
            {SHORTCUTS.map(({ keys, description }) => (
              <tr key={keys} className="border-t border-slate-100 first:border-t-0">
                <td className="py-1.5 pr-3 font-mono text-xs text-slate-500">{keys}</td>
                <td className="py-1.5 text-ink">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-ink hover:bg-slate-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShortcutsDialog;
