import { expect, test } from '@playwright/test';

import { clickPaletteItem, gotoEditor, objectTree, setNumberField } from './helpers';

// PHASE2_SPEC.md §19.3 회전체 시나리오
test('회전체(Lathe)를 생성해 병 모양 슬라이더로 형태를 바꿀 수 있다', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await gotoEditor(page);

  await clickPaletteItem(page, '회전체');
  await expect(objectTree(page)).toContainText('회전체 1');

  await setNumberField(page, '전체 높이', 1.4);
  await setNumberField(page, '몸통 폭', 0.5);
  await setNumberField(page, '병목 폭', 0.1);
  await setNumberField(page, '입구 폭', 0.12);

  // 프로필 변경마다 geometry가 재생성되어도 캔버스가 계속 정상 렌더링되는지 확인한다.
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
