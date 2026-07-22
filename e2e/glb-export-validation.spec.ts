import fs from 'node:fs/promises';

import { expect, test } from '@playwright/test';
import { GLTFLoader } from 'three-stdlib';

import { containsHangul, parseGlbBinary } from './glbBinary';
import { clickPaletteItem, geometryPanel, gotoEditor, setNumberField } from './helpers';

interface LoadedObject3D {
  type: string;
  name: string;
  isMesh?: boolean;
  material?: unknown;
  children: LoadedObject3D[];
}

function loadGltf(buffer: ArrayBuffer): Promise<{ scene: LoadedObject3D }> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(buffer, '', (gltf) => resolve(gltf as never), reject);
  });
}

function collectTraversal(root: LoadedObject3D): LoadedObject3D[] {
  const result: LoadedObject3D[] = [];
  const visit = (node: LoadedObject3D) => {
    result.push(node);
    node.children?.forEach(visit);
  };
  visit(root);
  return result;
}

// PHASE2_SPEC.md §16 GLB 내보내기 + §21-4/16: 실제 파서로 내보낸 GLB를 검증한다.
test('Torus·Lathe·테이퍼·휘어짐·복합 프리셋·한글 이름을 포함한 장면을 GLB로 내보내면 실제 파서로 정상 파싱된다', async ({
  page,
}) => {
  await gotoEditor(page);

  await clickPaletteItem(page, '링'); // Torus → "링 1"
  await clickPaletteItem(page, '회전체'); // Lathe → "회전체 1"

  await clickPaletteItem(page, '원기둥'); // Cylinder → "원기둥 1" (자동 선택)
  {
    const panel = geometryPanel(page);
    await panel.getByLabel('테이퍼').check();
    await setNumberField(page, '위쪽 굵기', 0.15);
  }

  await clickPaletteItem(page, '캡슐'); // Capsule → "캡슐 1" (자동 선택)
  {
    const panel = geometryPanel(page);
    await panel.getByLabel('휘어짐').check();
    const angleInput = panel.locator('label', { hasText: '강도' }).locator('input[type="number"]');
    await angleInput.fill('40');
    await angleInput.blur();
  }

  await clickPaletteItem(page, '기본 포션'); // 복합 프리셋 → group + 유리병 + 병목 링 + 코르크 마개

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'GLB 내보내기' }).click(),
  ]);

  const glbPath = await download.path();
  expect(glbPath).not.toBeNull();
  const buffer = await fs.readFile(glbPath!);

  // 1) GLB 컨테이너 자체를 직접 파싱 — 헤더/청크 구조와 원본(비가공) 이름 보존을 확인한다.
  const { version, json, hasBinChunk } = parseGlbBinary(buffer);
  expect(version).toBe(2);
  expect(hasBinChunk).toBe(true);
  expect(Array.isArray(json.scenes) && json.scenes.length).toBeGreaterThan(0);
  expect(Array.isArray(json.nodes) && json.nodes.length).toBeGreaterThan(0);
  expect(Array.isArray(json.meshes) && json.meshes.length).toBeGreaterThan(0);
  expect(Array.isArray(json.materials) && json.materials.length).toBeGreaterThan(0);

  const nodeNames = (json.nodes ?? []).map((node) => node.name).filter((name): name is string => Boolean(name));
  expect(nodeNames.some(containsHangul)).toBe(true);
  expect(nodeNames.some((name) => name.startsWith('링'))).toBe(true);
  expect(nodeNames.some((name) => name.startsWith('회전체'))).toBe(true);
  expect(nodeNames.some((name) => name.startsWith('원기둥'))).toBe(true);
  expect(nodeNames.some((name) => name.startsWith('캡슐'))).toBe(true);
  expect(nodeNames.some((name) => name.startsWith('기본 포션'))).toBe(true);
  // 복합 프리셋 자식은 카운터 없이 고정 이름을 그대로 쓴다(§10.5) — 공백이 그대로 보존되는지도 확인.
  expect(nodeNames).toContain('유리병');
  expect(nodeNames).toContain('병목 링');
  expect(nodeNames).toContain('코르크 마개');

  // 2) three.js 표준 파서(GLTFLoader)로 실제 파싱해 Scene/Group/Mesh/Material이 정상 존재하는지 확인한다.
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const gltf = await loadGltf(arrayBuffer);
  expect(gltf.scene).toBeTruthy();

  const allNodes = collectTraversal(gltf.scene);
  const types = allNodes.map((node) => node.type);
  expect(types).toContain('Group');
  expect(types).toContain('Mesh');

  const meshes = allNodes.filter((node) => node.isMesh);
  expect(meshes.length).toBeGreaterThanOrEqual(5); // 링, 회전체, 원기둥, 캡슐, 유리병, 병목 링, 코르크 마개
  meshes.forEach((mesh) => {
    expect(mesh.material).toBeTruthy();
  });
});
