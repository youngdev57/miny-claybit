import fs from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { clickPaletteItem, gotoEditor, numberFieldByLabel, objectTree, setNumberField } from './helpers';

// PHASE2_SPEC.md §19.2 Torus 시나리오
test('링(Torus)을 생성하고 파라미터를 조절한 뒤 저장하고 새로고침해도 복원된다', async ({ page }) => {
  await gotoEditor(page);

  await clickPaletteItem(page, '링');
  await expect(objectTree(page)).toContainText('링 1');

  await setNumberField(page, '전체 반지름', 0.5);
  await setNumberField(page, '링 굵기', 0.12);
  await setNumberField(page, '열림 각도', 270);

  await expect(numberFieldByLabel(page, '전체 반지름')).toHaveValue('0.5');
  await expect(numberFieldByLabel(page, '열림 각도')).toHaveValue('270');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'JSON 저장' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.project\.json$/);

  const savedPath = await download.path();
  expect(savedPath).not.toBeNull();
  const savedJson = JSON.parse(await fs.readFile(savedPath!, 'utf-8'));
  expect(savedJson.version).toBe(2);
  const torusObject = savedJson.scene.objects.find((object: { type: string }) => object.type === 'torus');
  expect(torusObject).toBeTruthy();
  expect(torusObject.geometryParams.radius).toBeCloseTo(0.5, 5);
  expect(torusObject.modifiers).toEqual({ taper: null, bend: null });

  // 자동 저장 반영을 기다린 뒤 새로고침해 복원 여부를 확인한다.
  await expect(page.getByTestId('status-bar')).toContainText('저장됨', { timeout: 5000 });
  await page.reload();
  await expect(objectTree(page)).toContainText('링 1');
});
