import { ASSET_PRESETS } from '@/features/editor/presets/assetPresets';
import type { PresetCategory } from '@/features/editor/presets/types';
import PresetItem from '@/features/editor/components/palette/PresetItem';
import { ko } from '@/i18n/ko';

const CATEGORY_ORDER: PresetCategory[] = ['character', 'potion', 'weapon', 'prop', 'environment'];

function PresetPalette() {
  const categoriesInUse = CATEGORY_ORDER.filter((category) =>
    ASSET_PRESETS.some((preset) => preset.category === category),
  );

  return (
    <div className="flex flex-col gap-3">
      {categoriesInUse.map((category) => (
        <div key={category} className="flex flex-col gap-1.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {ko.preset.category[category]}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ASSET_PRESETS.filter((preset) => preset.category === category).map((preset) => (
              <PresetItem key={preset.id} preset={preset} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PresetPalette;
