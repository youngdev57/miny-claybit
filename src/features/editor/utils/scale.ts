import type { Vec3 } from '@/features/editor/types/scene';

export const MIN_SCALE = 0.01;

/** 한 축의 목표 스케일 값을 적용한다. locked가 true면 비율을 유지하며 세 축 모두에 같은 배율을 적용한다. */
export function applyScaleAxis(currentScale: Vec3, axis: 0 | 1 | 2, targetValue: number, locked: boolean): Vec3 {
  const clamped = Math.max(targetValue, MIN_SCALE);
  const scale: Vec3 = [...currentScale];

  if (locked) {
    const previous = currentScale[axis] || MIN_SCALE;
    const factor = clamped / previous;
    scale[0] = Math.max(scale[0] * factor, MIN_SCALE);
    scale[1] = Math.max(scale[1] * factor, MIN_SCALE);
    scale[2] = Math.max(scale[2] * factor, MIN_SCALE);
  } else {
    scale[axis] = clamped;
  }

  return scale;
}
