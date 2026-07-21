import GeometryPanel from '@/features/editor/components/properties/GeometryPanel';
import MaterialPanel from '@/features/editor/components/properties/MaterialPanel';
import MaterialPresetList from '@/features/editor/components/properties/MaterialPresetList';
import SizePanel from '@/features/editor/components/properties/SizePanel';
import TransformPanel from '@/features/editor/components/properties/TransformPanel';
import { ko } from '@/i18n/ko';

function RightPanel() {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col gap-6 overflow-y-auto border-l border-slate-200 bg-white/80 p-4">
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{ko.transform.title}</h2>
        <TransformPanel />
      </section>
      <section data-testid="geometry-panel">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{ko.geometry.title}</h2>
        <GeometryPanel />
      </section>
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{ko.dimensions.title}</h2>
        <SizePanel />
      </section>
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{ko.material.title}</h2>
        <MaterialPanel />
      </section>
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">재질 프리셋</h2>
        <MaterialPresetList />
      </section>
    </aside>
  );
}

export default RightPanel;
