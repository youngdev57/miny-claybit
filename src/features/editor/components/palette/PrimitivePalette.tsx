import { PRIMITIVE_TYPES } from '@/features/editor/geometry/geometryDefaults';
import PrimitiveItem from '@/features/editor/components/palette/PrimitiveItem';

function PrimitivePalette() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PRIMITIVE_TYPES.map((type) => (
        <PrimitiveItem key={type} type={type} />
      ))}
    </div>
  );
}

export default PrimitivePalette;
