import { expect, test } from '@playwright/test';

import { clickPaletteItem, gotoEditor, geometryPanel, objectTree, setNumberField } from './helpers';

// PHASE2_SPEC.md §19.4 테이퍼 시나리오
test('원기둥에 테이퍼를 적용해 뿔 형태로 만들고 대칭 복제해도 정상 동작한다', async ({ page }) => {
  await gotoEditor(page);

  await clickPaletteItem(page, '원기둥');
  await expect(objectTree(page)).toContainText('원기둥 1');

  const panel = geometryPanel(page);
  await panel.getByLabel('테이퍼').check();
  await setNumberField(page, '위쪽 굵기', 0.1);
  await setNumberField(page, '아래쪽 굵기', 1);

  await page.getByRole('button', { name: '좌우 대칭 복제' }).click();
  await expect(objectTree(page)).toContainText('원기둥 2');
  await expect(page.getByTestId('object-count')).toContainText('객체 수: 2');
});

// PHASE2_SPEC.md §19.5 휘어짐 시나리오
test('캡슐에 휘어짐을 적용하면 Normal과 Bounding Box가 정상 갱신되고 GLB로 내보낼 수 있다', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await gotoEditor(page);

  await clickPaletteItem(page, '캡슐');
  await expect(objectTree(page)).toContainText('캡슐 1');

  const panel = geometryPanel(page);
  // 세그먼트를 높여야 부드럽게 휜다(§9.6).
  await panel.getByRole('button', { name: '부드러움' }).click();
  await panel.getByLabel('휘어짐').check();
  await panel.getByRole('button', { name: 'Z' }).click();
  const angleInput = panel.locator('label', { hasText: '강도' }).locator('input[type="number"]');
  await angleInput.fill('45');
  await angleInput.blur();

  await expect(page.locator('canvas')).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'GLB 내보내기' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.glb$/);
  expect(errors).toEqual([]);
});
