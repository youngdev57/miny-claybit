import LeftPanel from '@/features/editor/components/layout/LeftPanel';
import RightPanel from '@/features/editor/components/layout/RightPanel';
import StatusBar from '@/features/editor/components/layout/StatusBar';
import TopBar from '@/features/editor/components/layout/TopBar';
import Viewport from '@/features/editor/components/viewport/Viewport';
import { useAutosave } from '@/features/editor/hooks/useAutosave';
import { useKeyboardShortcuts } from '@/features/editor/hooks/useKeyboardShortcuts';

function EditorPage() {
  useKeyboardShortcuts();
  useAutosave();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <LeftPanel />
        <div className="min-w-0 flex-1">
          <Viewport />
        </div>
        <RightPanel />
      </div>
      <StatusBar />
    </div>
  );
}

export default EditorPage;
