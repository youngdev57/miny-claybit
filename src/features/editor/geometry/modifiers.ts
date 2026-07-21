import type { BufferGeometry } from 'three';

import type { BendModifier, ObjectModifiers, TaperModifier } from '@/features/editor/types/scene';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * 위/아래 굵기를 다르게 만든다(§8). Geometry의 원래 Y 범위를 기준으로 각 정점의 X/Z를
 * bottomScale~topScale 사이로 선형 보간해 스케일한다.
 */
function applyTaper(geometry: BufferGeometry, taper: TaperModifier): void {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return;
  const minY = box.min.y;
  const maxY = box.max.y;
  const heightRange = maxY - minY;
  if (heightRange <= 0) return;

  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const t = (y - minY) / heightRange;
    const scale = lerp(taper.bottomScale, taper.topScale, t);
    position.setXYZ(i, x * scale, y, z * scale);
  }
  position.needsUpdate = true;
}

/**
 * 직선형 도형을 구부린다(§9). start/end(0~1, 로컬 Y 범위 기준)로 정의된 구간을 각도만큼
 * 호(arc) 형태로 휘고, 구간 이후 부분은 끝점의 회전을 그대로 이어 붙인다(rigid 연장).
 * axis='x'는 XY 평면에서, axis='z'는 ZY 평면에서 휜다.
 */
function applyBend(geometry: BufferGeometry, bend: BendModifier): void {
  if (Math.abs(bend.angle) < 1e-6) return;

  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return;
  const minY = box.min.y;
  const maxY = box.max.y;
  const totalHeight = maxY - minY;
  if (totalHeight <= 0) return;

  const startY = minY + Math.min(bend.start, bend.end) * totalHeight;
  const endY = minY + Math.max(bend.start, bend.end) * totalHeight;
  const regionHeight = endY - startY;
  if (regionHeight <= 0) return;

  const angle = bend.angle;
  const radius = regionHeight / angle;
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    // 굽는 방향의 좌표(off = 굽힘축에서 벗어난 정도), 굽지 않는 축은 그대로 둔다.
    const off = bend.axis === 'x' ? x : z;

    let theta: number;
    let extra = 0;
    if (y <= startY) {
      theta = 0;
    } else if (y >= endY) {
      theta = angle;
      extra = y - endY;
    } else {
      theta = ((y - startY) / regionHeight) * angle;
    }

    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const arcAlong = radius * sinT; // 굽힘 축(y) 방향으로의 진행
    const arcOff = radius * (1 - cosT); // 굽는 방향으로의 변위

    // 단면(off)도 theta만큼 함께 회전시켜 관을 구부린 것처럼 보이게 하고,
    // 구간 밖(extra)은 끝점의 접선 방향으로 그대로 이어 붙인다.
    const finalOff = arcOff + off * cosT + extra * sinT;
    const finalAlong = startY + arcAlong - off * sinT + extra * cosT;

    if (bend.axis === 'x') {
      position.setXYZ(i, finalOff, finalAlong, z);
    } else {
      position.setXYZ(i, x, finalAlong, finalOff);
    }
  }
  position.needsUpdate = true;
}

/**
 * PHASE2_SPEC §9.5 변형 순서를 따른다: 기본 Geometry(호출 전) → 테이퍼 → 휘어짐 → Normal 재계산 →
 * Bounding Box 재계산. 활성화된 모디파이어가 없으면 원본 geometry를 그대로 반환한다.
 */
export function applyModifiers(geometry: BufferGeometry, modifiers?: ObjectModifiers | null): BufferGeometry {
  if (!modifiers) return geometry;

  let changed = false;
  if (modifiers.taper?.enabled) {
    applyTaper(geometry, modifiers.taper);
    changed = true;
  }
  if (modifiers.bend?.enabled) {
    applyBend(geometry, modifiers.bend);
    changed = true;
  }

  if (changed) {
    geometry.computeVertexNormals();
  }
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}
