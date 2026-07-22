import { expect, test } from '@playwright/test';

import { clickPaletteItem, geometryPanel, gotoEditor, numberFieldByLabel, setNumberField } from './helpers';

// PHASE2_SPEC.md §21-14 (구멍 보완): 도형 파라미터(geometryParams) 변경도 Undo/Redo 대상이어야 한다.
test('도형 파라미터 변경도 Undo/Redo로 되돌릴 수 있다', async ({ page }) => {
  await gotoEditor(page);
  await clickPaletteItem(page, '링');

  const radius = numberFieldByLabel(page, '전체 반지름');
  await expect(radius).toHaveValue('0.35'); // geometryDefaults.ts 기본값

  await setNumberField(page, '전체 반지름', 0.7);
  await expect(radius).toHaveValue('0.7');

  await page.getByRole('button', { name: '실행 취소' }).click();
  await expect(radius).toHaveValue('0.35');

  await page.getByRole('button', { name: '다시 실행' }).click();
  await expect(radius).toHaveValue('0.7');
});

// PHASE2_SPEC.md §21-14 (구멍 보완): 모디파이어(taper/bend) 변경도 Undo/Redo 대상이어야 한다.
test('모디파이어(테이퍼) 사용 여부도 Undo/Redo로 되돌릴 수 있다', async ({ page }) => {
  await gotoEditor(page);
  await clickPaletteItem(page, '원기둥');

  const taperCheckbox = geometryPanel(page).getByLabel('테이퍼');
  await expect(taperCheckbox).not.toBeChecked();

  await taperCheckbox.check();
  await expect(taperCheckbox).toBeChecked();

  await page.getByRole('button', { name: '실행 취소' }).click();
  await expect(taperCheckbox).not.toBeChecked();

  await page.getByRole('button', { name: '다시 실행' }).click();
  await expect(taperCheckbox).toBeChecked();
});

// PHASE2_SPEC.md §9.6 / §21-9 (구멍 보완): X축 대칭 복제 시 bend.axis==='x'인 각도가 실제로 반전되는지 확인한다.
test('휘어짐(축=X)이 적용된 객체를 X축 대칭 복제하면 각도가 반전된다', async ({ page }) => {
  await gotoEditor(page);
  await clickPaletteItem(page, '캡슐');

  const panel = geometryPanel(page);
  await panel.getByLabel('휘어짐').check();
  await panel.getByRole('button', { name: 'X', exact: true }).click();
  const angleInput = panel.locator('label', { hasText: '강도' }).locator('input[type="number"]');
  await angleInput.fill('60');
  await angleInput.blur();
  await expect(angleInput).toHaveValue('60');

  // mirrorObjectX는 복제본을 자동 선택하므로 형태 패널이 곧바로 새 객체 값을 보여준다.
  await page.getByRole('button', { name: '좌우 대칭 복제' }).click();
  await expect(angleInput).toHaveValue('-60');
  await expect(panel.getByRole('button', { name: 'X', exact: true })).toHaveClass(/border-signal/);
});
