import ObjectTree from '@/features/editor/components/hierarchy/ObjectTree';
import PresetPalette from '@/features/editor/components/palette/PresetPalette';
import PrimitivePalette from '@/features/editor/components/palette/PrimitivePalette';
import { ko } from '@/i18n/ko';

function LeftPanel() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-slate-200 bg-white/80 p-4">
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">도형 팔레트</h2>
        <PrimitivePalette />
      </section>
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{ko.preset.title}</h2>
        <PresetPalette />
      </section>
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">객체 목록</h2>
        <ObjectTree />
      </section>
    </aside>
  );
}

export default LeftPanel;
