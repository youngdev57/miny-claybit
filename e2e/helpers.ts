import type { Page } from '@playwright/test';

/** 도형/프리셋 팔레트 카드는 클릭만으로도 원점에 생성되므로(드래그앤드롭 대체 경로) 테스트에서는 클릭을 사용한다. */
export async function clickPaletteItem(page: Page, label: string) {
  await page.getByRole('button', { name: label, exact: true }).click();
}

/** NumberField/SliderField는 `<label><span>{라벨}</span><input/></label>` 구조를 공유한다. */
export function numberFieldByLabel(page: Page, label: string) {
  return page.locator('label', { hasText: label }).locator('input[type="number"]');
}

export async function setNumberField(page: Page, label: string, value: number) {
  const input = numberFieldByLabel(page, label);
  await input.fill(String(value));
  await input.blur();
}

export function objectTree(page: Page) {
  return page.getByTestId('object-tree');
}

export function geometryPanel(page: Page) {
  return page.getByTestId('geometry-panel');
}

export async function gotoEditor(page: Page) {
  await page.goto('/');
  await objectTree(page).waitFor({ state: 'visible' });
}
