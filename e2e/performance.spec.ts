import { expect, test } from '@playwright/test';

import { gotoEditor, setNumberField } from './helpers';

// PHASE2_SPEC.md §20 성능 제한 / §18 Phase 2D 완료 조건: 100개 객체 기준 편집 성능 유지
test('100개 객체를 생성해도 응답성 있게 계속 편집할 수 있다', async ({ page }) => {
  test.slow();
  await gotoEditor(page);

  const objectButton = page.getByRole('button', { name: '상자', exact: true });

  const start = Date.now();
  for (let i = 0; i < 100; i += 1) {
    await objectButton.click();
  }
  const createElapsed = Date.now() - start;

  await expect(page.getByTestId('object-count')).toContainText('객체 수: 100');
  // 심각한 성능 저하(예: 매 생성마다 O(n) 이상 비용 누적)를 감지하기 위한 넉넉한 상한선.
  expect(createElapsed).toBeLessThan(60_000);

  // 100개 상태에서도 마지막으로 생성된 객체(자동 선택됨)의 속성 편집이 즉시 반영되는지 확인한다.
  const editStart = Date.now();
  await setNumberField(page, '너비', 1.5);
  await expect(page.locator('label', { hasText: '너비' }).locator('input[type="number"]')).toHaveValue('1.5');
  const editElapsed = Date.now() - editStart;
  expect(editElapsed).toBeLessThan(5_000);
});
