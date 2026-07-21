import type { MaterialState } from '@/features/editor/types/material';
import type { GeometryParams, NodeType, ObjectModifiers, Vec3 } from '@/features/editor/types/scene';
import type { ko } from '@/i18n/ko';

export type PresetCategory = 'character' | 'potion' | 'weapon' | 'prop' | 'environment';

export interface PresetObject {
  /** 'group'을 포함한다 — 복합 프리셋(§10.5)의 루트 컨테이너로 사용. */
  type: NodeType;
  /** 지정하지 않으면 루트 오브젝트로 취급되어 프리셋 이름 카운터(nameKey 기반)로 이름이 생성된다.
   * 자식 오브젝트는 이 고정된 표시 이름을 그대로 사용한다. */
  name?: string;
  geometryParams?: Partial<GeometryParams>;
  material?: Partial<MaterialState>;
  /** 루트 오브젝트는 드롭 위치 기준 오프셋, 자식 오브젝트는 부모(그룹) 기준 로컬 좌표. */
  position?: Vec3;
  /** objects 배열 내 부모 인덱스. 지정하지 않으면(undefined/null) 루트 오브젝트. */
  parentIndex?: number | null;
  /** 테이퍼/휘어짐을 미리 적용한 프리셋(예: 늘어진 귀)에 사용. taper/bend는 완전한 객체로 지정한다. */
  modifiers?: Partial<ObjectModifiers>;
}

export interface AssetPreset {
  id: string;
  /** ko.preset.items의 키. */
  nameKey: keyof typeof ko.preset.items;
  category: PresetCategory;
  objects: PresetObject[];
}
