import { expect, test } from '@playwright/test';
import type { BufferGeometry } from 'three';

import { applyModifiers } from '@/features/editor/geometry/modifiers';
import { createGeometryInstance } from '@/features/editor/geometry/primitiveFactory';
import { computeSceneBoundingBox, getLocalDimensions } from '@/features/editor/utils/bounds';
import type { CylinderGeometryParams, LatheGeometryParams, SceneObject } from '@/features/editor/types/scene';

/**
 * modifiers.ts/bounds.ts를 브라우저 없이 Node 컨텍스트에서 직접 호출하는 유닛 테스트.
 * PHASE2_SPEC §9.5/§9.8/§8.5/§20이 요구하는 "Normal 재계산", "Bounding Box 정상 갱신"을
 * 시각 확인이 아니라 실제 수치로 검증한다.
 */

function positions(geometry: BufferGeometry): Array<[number, number, number]> {
  const attr = geometry.attributes.position;
  const result: Array<[number, number, number]> = [];
  for (let i = 0; i < attr.count; i += 1) {
    result.push([attr.getX(i), attr.getY(i), attr.getZ(i)]);
  }
  return result;
}

function allFinite(values: number[]): boolean {
  return values.every((value) => Number.isFinite(value));
}

function baseSceneObject(overrides: Partial<SceneObject>): SceneObject {
  return {
    id: 'test-object',
    name: '테스트',
    type: 'box',
    parentId: null,
    visible: true,
    locked: false,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modifiers: { taper: null, bend: null },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

test.describe('테이퍼(applyModifiers)', () => {
  test('위쪽 반지름이 topScale만큼 줄고 아래쪽은 그대로 유지되며 값이 모두 유한하다', () => {
    const params: CylinderGeometryParams = { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 16 };
    const geometry = createGeometryInstance('cylinder', params);

    applyModifiers(geometry, { taper: { enabled: true, topScale: 0.2, bottomScale: 1 }, bend: null });

    const pts = positions(geometry);
    expect(allFinite(pts.flat())).toBe(true);

    // CylinderGeometry의 상/하단 캡에는 중심점(반지름 0)도 포함되므로 테두리 정점만 걸러서 확인한다.
    const epsilon = 1e-6;
    const topRim = pts.filter(([x, y, z]) => Math.abs(y - 0.5) < epsilon && Math.hypot(x, z) > 0.01);
    const bottomRim = pts.filter(([x, y, z]) => Math.abs(y - -0.5) < epsilon && Math.hypot(x, z) > 0.01);
    expect(topRim.length).toBeGreaterThan(0);
    expect(bottomRim.length).toBeGreaterThan(0);

    for (const [x, , z] of topRim) {
      expect(Math.hypot(x, z)).toBeCloseTo(0.5 * 0.2, 5);
    }
    for (const [x, , z] of bottomRim) {
      expect(Math.hypot(x, z)).toBeCloseTo(0.5 * 1, 5);
    }

    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    expect(Number.isFinite(box.min.x) && Number.isFinite(box.max.x)).toBe(true);
    // 아래쪽 반지름(0.5)이 그대로라 전체 X 폭은 여전히 0.5 근방이어야 한다(위쪽만 좁아졌으므로).
    expect(box.max.x).toBeCloseTo(0.5, 5);
  });
});

test.describe('휘어짐(applyModifiers)', () => {
  test('90도로 휘면 Y 범위는 줄고 굽는 방향 범위는 늘며, Normal은 유한하고 단위 길이를 유지한다', () => {
    const params: CylinderGeometryParams = { radiusTop: 0.1, radiusBottom: 0.1, height: 1, radialSegments: 12 };
    const originalGeometry = createGeometryInstance('cylinder', params);
    originalGeometry.computeBoundingBox();
    const originalYRange = originalGeometry.boundingBox!.max.y - originalGeometry.boundingBox!.min.y;
    const originalZRange = originalGeometry.boundingBox!.max.z - originalGeometry.boundingBox!.min.z;

    const geometry = createGeometryInstance('cylinder', params);
    applyModifiers(geometry, { taper: null, bend: { enabled: true, axis: 'z', angle: Math.PI / 2, start: 0, end: 1 } });

    const pts = positions(geometry);
    expect(allFinite(pts.flat())).toBe(true);

    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const newYRange = box.max.y - box.min.y;
    const newZRange = box.max.z - box.min.z;

    // §9.5 "Bounding Box 재계산" — 휘면 세로 범위는 줄고(호를 그리므로) 굽는 방향(Z) 범위는 늘어야 한다.
    expect(newYRange).toBeLessThan(originalYRange);
    expect(newZRange).toBeGreaterThan(originalZRange);
    expect(Number.isFinite(newYRange) && Number.isFinite(newZRange)).toBe(true);

    // §9.5 "Normal 재계산" — 정점 수와 일치하고, 모두 유한하며, 단위 벡터로 정규화되어 있어야 한다.
    const normalAttr = geometry.attributes.normal;
    expect(normalAttr.count).toBe(geometry.attributes.position.count);
    let sampledUnitLength = 0;
    for (let i = 0; i < normalAttr.count; i += 7) {
      const nx = normalAttr.getX(i);
      const ny = normalAttr.getY(i);
      const nz = normalAttr.getZ(i);
      expect(Number.isFinite(nx) && Number.isFinite(ny) && Number.isFinite(nz)).toBe(true);
      const length = Math.hypot(nx, ny, nz);
      expect(length).toBeCloseTo(1, 2);
      sampledUnitLength += 1;
    }
    expect(sampledUnitLength).toBeGreaterThan(0);
  });

  test('비활성 모디파이어는 geometry를 변형하지 않는다(no-op)', () => {
    const params: CylinderGeometryParams = { radiusTop: 0.3, radiusBottom: 0.3, height: 0.8, radialSegments: 8 };
    const before = createGeometryInstance('cylinder', params);
    const beforePts = positions(before);

    const after = createGeometryInstance('cylinder', params);
    applyModifiers(after, { taper: { enabled: false, topScale: 0.1, bottomScale: 1 }, bend: null });
    const afterPts = positions(after);

    expect(afterPts).toEqual(beforePts);
  });
});

test.describe('Bounding Box(bounds.ts)', () => {
  test('Lathe는 y=0(바닥)부터 시작하므로 원점 대칭으로 가정하면 안 된다 (Phase 2C 회귀 테스트)', () => {
    const profile: LatheGeometryParams['profile'] = [
      { y: 0, radius: 0.2 },
      { y: 1.1, radius: 0.18 },
    ];
    const latheObject = baseSceneObject({
      type: 'lathe',
      position: [0, 0, 0], // getRestingYOffset('lathe', ...) === 0 이므로 바닥에 놓인 상태
      geometryParams: { profile, segments: 16, phiStart: 0, phiLength: Math.PI * 2 },
    });

    const box = computeSceneBoundingBox([latheObject]);
    expect(box).not.toBeNull();
    // 예전 버그: 모든 도형을 ±height/2로 가정해 min.y가 -0.55로 잘못 계산되었다.
    expect(box!.min.y).toBeCloseTo(0, 5);
    expect(box!.max.y).toBeCloseTo(1.1, 5);
  });

  test('테이퍼가 활성화된 객체의 Bounding Box는 실제 변형된 geometry를 반영한다', () => {
    const cylinderObject = baseSceneObject({
      type: 'cylinder',
      position: [0, 0.5, 0], // getRestingYOffset('cylinder', height=1) === 0.5
      geometryParams: { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 16 },
      modifiers: { taper: { enabled: true, topScale: 0.2, bottomScale: 1 }, bend: null },
    });

    const box = computeSceneBoundingBox([cylinderObject]);
    expect(box).not.toBeNull();
    expect(Number.isFinite(box!.min.y) && Number.isFinite(box!.max.y)).toBe(true);
    // 테이퍼는 Y를 건드리지 않으므로 세로 범위는 원래 높이(1) 그대로여야 한다.
    expect(box!.min.y).toBeCloseTo(0, 2);
    expect(box!.max.y).toBeCloseTo(1, 2);
    // 아래쪽 반지름(0.5)이 그대로라 전체 폭은 여전히 1(지름) 근방이어야 한다.
    expect(box!.max.x - box!.min.x).toBeCloseTo(1, 1);
  });

  test('getLocalDimensions는 스케일 적용 전 로컬 크기를 정확히 계산한다', () => {
    const profile: LatheGeometryParams['profile'] = [
      { y: 0.2, radius: 0.1 },
      { y: 0.2, radius: 0.3 },
      { y: 1.5, radius: 0.25 },
    ];
    const [width, height, depth] = getLocalDimensions('lathe', { profile, segments: 16, phiStart: 0, phiLength: Math.PI * 2 });
    expect(height).toBeCloseTo(1.5 - 0.2, 5);
    expect(width).toBeCloseTo(0.3 * 2, 5);
    expect(depth).toBeCloseTo(0.3 * 2, 5);
  });
});
