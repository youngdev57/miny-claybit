import { expect, test } from '@playwright/test';

import { gotoEditor, objectTree } from './helpers';

const LEGACY_V1_PROJECT = {
  version: 1,
  project: {
    id: 'legacy-project',
    name: 'V1 프로젝트',
    unit: 'meter',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  scene: {
    objects: [
      {
        id: 'legacy-box-1',
        name: '상자 1',
        type: 'box',
        parentId: null,
        visible: true,
        locked: false,
        position: [0, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryParams: { width: 1, height: 1, depth: 1 },
        material: {
          color: '#d9d9d9',
          roughness: 0.7,
          metalness: 0,
          opacity: 1,
          transparent: false,
          emissive: '#000000',
          emissiveIntensity: 0,
          flatShading: false,
          doubleSided: false,
        },
        // modifiers 필드가 없는 것이 핵심 — MVP(v1) 저장분에는 존재하지 않았다.
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    rootObjectIds: ['legacy-box-1'],
  },
  editor: { selectedObjectId: null, cameraMode: 'perspective', gridVisible: true, axisVisible: true },
};

// PHASE2_SPEC.md §15 JSON 호환성: 기존 MVP(v1) 프로젝트 JSON을 불러오면 v2로 자동 마이그레이션된다.
test('기존 MVP(v1) 프로젝트 JSON을 불러오면 modifiers가 채워진 v2로 마이그레이션되어 정상 표시된다', async ({ page }) => {
  await gotoEditor(page);

  await page.locator('input[type="file"]').setInputFiles({
    name: 'legacy.project.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(LEGACY_V1_PROJECT)),
  });

  await expect(objectTree(page)).toContainText('상자 1');
  await expect(page.getByRole('alert')).toHaveCount(0);

  // modifiers가 없는 v1 객체를 선택해도 형태 패널이 에러 없이 렌더링되는지 확인한다.
  await page.getByRole('button', { name: '상자 1' }).click();
  await expect(page.getByTestId('geometry-panel')).toBeVisible();
});
