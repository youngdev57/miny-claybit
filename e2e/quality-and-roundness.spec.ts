import { expect, test } from '@playwright/test';

import { clickPaletteItem, geometryPanel, gotoEditor, numberFieldByLabel, setNumberField } from './helpers';

// PHASE2_SPEC.md §21-6 도형 품질 프리셋(저폴리/기본/부드러움)이 실제 세그먼트 값을 바꾸는지 확인한다.
test('품질 프리셋 버튼을 누르면 세그먼트 숫자 필드가 사양대로 바뀐다', async ({ page }) => {
  await gotoEditor(page);
  await clickPaletteItem(page, '구');

  const widthSegments = numberFieldByLabel(page, '가로 분할');
  const heightSegments = numberFieldByLabel(page, '세로 분할');

  // 기본 생성값(geometryDefaults.ts createDefaultGeometryParams: sphere)
  await expect(widthSegments).toHaveValue('32');
  await expect(heightSegments).toHaveValue('16');

  const panel = geometryPanel(page);
  await panel.getByRole('button', { name: '저폴리' }).click();
  await expect(widthSegments).toHaveValue('12');
  await expect(heightSegments).toHaveValue('8');

  await panel.getByRole('button', { name: '부드러움' }).click();
  await expect(widthSegments).toHaveValue('64');
  await expect(heightSegments).toHaveValue('32');

  await panel.getByRole('button', { name: '기본', exact: true }).click();
  await expect(widthSegments).toHaveValue('32');
  await expect(heightSegments).toHaveValue('16');
});

// PHASE2_SPEC.md §21-7 Rounded Box 둥글기 조절 + 퇴화 지오메트리 방지 클램프.
test('둥근 상자의 둥글기를 조절할 수 있고 치수 절반을 넘는 값은 클램프된다', async ({ page }) => {
  await gotoEditor(page);
  await clickPaletteItem(page, '둥근 상자');

  const radius = numberFieldByLabel(page, '둥글기');
  await expect(radius).toHaveValue('0.1'); // createDefaultGeometryParams: roundedBox 기본값

  await setNumberField(page, '둥글기', 0.3);
  await expect(radius).toHaveValue('0.3');

  // width/height/depth 기본값이 1이므로 최대 허용치는 1/2 - 0.001 = 0.499 부근이어야 한다.
  await setNumberField(page, '둥글기', 10);
  const clamped = Number(await radius.inputValue());
  expect(clamped).toBeGreaterThan(0.49);
  expect(clamped).toBeLessThanOrEqual(0.5);
});
