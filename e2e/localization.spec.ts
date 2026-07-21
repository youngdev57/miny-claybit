import { expect, test } from '@playwright/test';

import { clickPaletteItem, gotoEditor, objectTree } from './helpers';

// PHASE2_SPEC.md §19.1 한글화 시나리오
test('에디터 주요 UI가 한글로 표시되고 신규 객체 이름도 한글로 생성된다', async ({ page }) => {
  await gotoEditor(page);

  await expect(page.getByRole('button', { name: '새 프로젝트' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'JSON 저장' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'JSON 불러오기' })).toBeVisible();
  await expect(page.getByRole('button', { name: '실행 취소' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'GLB 내보내기' })).toBeVisible();

  await expect(page.getByText('도형 팔레트')).toBeVisible();
  await expect(page.getByText('프리셋', { exact: true })).toBeVisible();
  await expect(page.getByText('객체 목록')).toBeVisible();
  await expect(page.getByText('변형', { exact: true })).toBeVisible();
  await expect(page.getByText('형태', { exact: true })).toBeVisible();
  await expect(page.getByText('실제 크기')).toBeVisible();
  await expect(page.getByText('재질', { exact: true })).toBeVisible();

  await clickPaletteItem(page, '구');
  await expect(objectTree(page)).toContainText('구 1');
  await expect(page.getByTestId('object-count')).toContainText('객체 수: 1');
});
