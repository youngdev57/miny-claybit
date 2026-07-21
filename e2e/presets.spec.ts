import { expect, test } from '@playwright/test';

import { clickPaletteItem, gotoEditor, objectTree } from './helpers';

// PHASE2_SPEC.md §19.6 프리셋 시나리오
test('단일 프리셋과 복합 프리셋을 생성할 수 있고 복합 프리셋은 한 번의 실행 취소로 제거된다', async ({ page }) => {
  await gotoEditor(page);

  await clickPaletteItem(page, '병목 링');
  await expect(objectTree(page)).toContainText('병목 링 1');
  await expect(page.getByTestId('object-count')).toContainText('객체 수: 1');

  await clickPaletteItem(page, '기본 포션');
  const tree = objectTree(page);
  await expect(tree).toContainText('기본 포션 1');
  await expect(tree).toContainText('유리병');
  await expect(tree).toContainText('병목 링');
  await expect(tree).toContainText('코르크 마개');
  // 병목 링(1) + 기본 포션 그룹(group+유리병+병목 링+코르크 마개=4) = 총 5개.
  await expect(page.getByTestId('object-count')).toContainText('객체 수: 5');

  await page.getByRole('button', { name: '실행 취소' }).click();
  await expect(tree).not.toContainText('기본 포션 1');
  await expect(page.getByTestId('object-count')).toContainText('객체 수: 1');
});
