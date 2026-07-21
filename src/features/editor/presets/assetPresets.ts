import { BOTTLE_PROFILES, getProfileHeight } from '@/features/editor/geometry/latheProfile';
import { degToRad } from '@/features/editor/utils/angle';
import type { AssetPreset, PresetObject } from '@/features/editor/presets/types';
import type { LatheProfilePoint } from '@/features/editor/types/scene';

/** 로컬 y=0(바닥)에서 시작하는 뭉툭한 방울 모양 — 슬라임 몸통에 사용한다. */
const SLIME_PROFILE: LatheProfilePoint[] = [
  { y: 0, radius: 0.28 },
  { y: 0.05, radius: 0.34 },
  { y: 0.22, radius: 0.32 },
  { y: 0.38, radius: 0.2 },
  { y: 0.46, radius: 0.05 },
];

/** 버섯 갓 모양 — 넓은 아랫단에서 둥글게 좁아지는 프로필. */
const MUSHROOM_CAP_PROFILE: LatheProfilePoint[] = [
  { y: 0, radius: 0.34 },
  { y: 0.04, radius: 0.36 },
  { y: 0.14, radius: 0.28 },
  { y: 0.22, radius: 0.12 },
  { y: 0.26, radius: 0.02 },
];

/**
 * PHASE2_SPEC §10.2 "단일 도형 프리셋" 중 테이퍼·휘어짐 없이 현재 도형만으로 구현 가능한 항목.
 * 늘어진 귀처럼 휘어짐 모디파이어가 필요한 항목은 Phase 2C 이후로 미룬다.
 */
export const ASSET_PRESETS: AssetPreset[] = [
  {
    id: 'shortArm',
    nameKey: 'shortArm',
    category: 'character',
    objects: [{ type: 'capsule', geometryParams: { radius: 0.09, length: 0.35 } }],
  },
  {
    id: 'shortLeg',
    nameKey: 'shortLeg',
    category: 'character',
    objects: [{ type: 'capsule', geometryParams: { radius: 0.11, length: 0.3 } }],
  },
  {
    id: 'roundHead',
    nameKey: 'roundHead',
    category: 'character',
    objects: [{ type: 'sphere', geometryParams: { radius: 0.4 } }],
  },
  {
    id: 'pointedEar',
    nameKey: 'pointedEar',
    category: 'character',
    objects: [{ type: 'cone', geometryParams: { radius: 0.08, height: 0.22 } }],
  },
  {
    id: 'smallHorn',
    nameKey: 'smallHorn',
    category: 'character',
    objects: [{ type: 'cone', geometryParams: { radius: 0.05, height: 0.16 } }],
  },
  {
    id: 'droopyEar',
    nameKey: 'droopyEar',
    category: 'character',
    objects: [
      {
        type: 'capsule',
        geometryParams: { radius: 0.06, length: 0.3 },
        modifiers: { bend: { enabled: true, axis: 'z', angle: degToRad(100), start: 0.35, end: 1 } },
      },
    ],
  },
  {
    id: 'swordBlade',
    nameKey: 'swordBlade',
    category: 'weapon',
    objects: [{ type: 'box', geometryParams: { width: 0.08, height: 0.7, depth: 0.015 } }],
  },
  {
    id: 'handle',
    nameKey: 'handle',
    category: 'weapon',
    objects: [{ type: 'cylinder', geometryParams: { radiusTop: 0.03, radiusBottom: 0.03, height: 0.18 } }],
  },
  {
    id: 'cork',
    nameKey: 'cork',
    category: 'prop',
    objects: [{ type: 'cylinder', geometryParams: { radiusTop: 0.09, radiusBottom: 0.08, height: 0.12 } }],
  },
  {
    id: 'bottleRing',
    nameKey: 'bottleRing',
    category: 'prop',
    objects: [{ type: 'torus', geometryParams: { radius: 0.14, tube: 0.025 } }],
  },
  {
    id: 'roundBottle',
    nameKey: 'roundBottle',
    category: 'potion',
    objects: [{ type: 'lathe', geometryParams: { profile: BOTTLE_PROFILES.round } }],
  },
  {
    id: 'tallBottle',
    nameKey: 'tallBottle',
    category: 'potion',
    objects: [{ type: 'lathe', geometryParams: { profile: BOTTLE_PROFILES.tall } }],
  },
  {
    id: 'jarBottle',
    nameKey: 'jarBottle',
    category: 'potion',
    objects: [{ type: 'lathe', geometryParams: { profile: BOTTLE_PROFILES.jar } }],
  },
  createPotionPreset('basicPotion', 'basicPotion', BOTTLE_PROFILES.round),
  createPotionPreset('tallPotion', 'tallPotion', BOTTLE_PROFILES.tall),
  createSwordPreset(),
  createShieldPreset(),
  {
    id: 'slime',
    nameKey: 'slime',
    category: 'character',
    objects: [
      {
        type: 'lathe',
        geometryParams: { profile: SLIME_PROFILE },
        material: { color: '#4ade80', opacity: 0.8, transparent: true, roughness: 0.25 },
      },
    ],
  },
  createMushroomMonsterPreset(),
  createSimpleCharacterBodyPreset(),
];

/** PHASE2_SPEC §10.5 복합 프리셋: 루트 group + 검날(box) + 손잡이 보호대(box) + 손잡이(cylinder). */
function createSwordPreset(): AssetPreset {
  const objects: PresetObject[] = [
    { type: 'group' },
    {
      type: 'box',
      name: '검날',
      parentIndex: 0,
      geometryParams: { width: 0.08, height: 0.7, depth: 0.015 },
      position: [0, 0.37, 0],
      material: { color: '#cbd5e1', metalness: 0.8, roughness: 0.25 },
    },
    {
      type: 'box',
      name: '손잡이 보호대',
      parentIndex: 0,
      geometryParams: { width: 0.22, height: 0.03, depth: 0.05 },
      position: [0, 0, 0],
      material: { color: '#b45309', metalness: 0.5, roughness: 0.4 },
    },
    {
      type: 'cylinder',
      name: '손잡이',
      parentIndex: 0,
      geometryParams: { radiusTop: 0.025, radiusBottom: 0.025, height: 0.16 },
      position: [0, -0.1, 0],
      material: { color: '#7c4a24', roughness: 0.8 },
    },
  ];

  return { id: 'basicSword', nameKey: 'basicSword', category: 'weapon', objects };
}

/** 복합 프리셋: 루트 group + 방패 몸체(roundedBox) + 중앙 돌기(sphere). */
function createShieldPreset(): AssetPreset {
  const objects: PresetObject[] = [
    { type: 'group' },
    {
      type: 'roundedBox',
      name: '방패 몸체',
      parentIndex: 0,
      geometryParams: { width: 0.5, height: 0.6, depth: 0.06, radius: 0.08, smoothness: 4 },
      position: [0, 0.3, 0],
      material: { color: '#7f1d1d', roughness: 0.6 },
    },
    {
      type: 'sphere',
      name: '중앙 돌기',
      parentIndex: 0,
      geometryParams: { radius: 0.06 },
      position: [0, 0.3, 0.06],
      material: { color: '#eab308', metalness: 0.7, roughness: 0.3 },
    },
  ];

  return { id: 'basicShield', nameKey: 'basicShield', category: 'weapon', objects };
}

/** 복합 프리셋: 루트 group + 기둥(cylinder) + 갓(lathe). */
function createMushroomMonsterPreset(): AssetPreset {
  const stemHeight = 0.3;
  const objects: PresetObject[] = [
    { type: 'group' },
    {
      type: 'cylinder',
      name: '기둥',
      parentIndex: 0,
      geometryParams: { radiusTop: 0.09, radiusBottom: 0.11, height: stemHeight },
      position: [0, stemHeight / 2, 0],
      material: { color: '#fef3c7', roughness: 0.6 },
    },
    {
      type: 'lathe',
      name: '갓',
      parentIndex: 0,
      geometryParams: { profile: MUSHROOM_CAP_PROFILE },
      position: [0, stemHeight, 0],
      material: { color: '#dc2626', roughness: 0.5 },
    },
  ];

  return { id: 'mushroomMonster', nameKey: 'mushroomMonster', category: 'character', objects };
}

/** 복합 프리셋: 루트 group + 몸통 + 머리 + 팔 2개 + 다리 2개. §16.1 예시 크기(~1.2m)에 근접하도록 설계. */
function createSimpleCharacterBodyPreset(): AssetPreset {
  const legHalfHeight = 0.19; // length/2 + radius = 0.11 + 0.08
  const legY = legHalfHeight;
  const legTopY = legY + legHalfHeight;
  const torsoHalfHeight = 0.31; // length/2 + radius = 0.15 + 0.16
  const torsoY = legTopY + torsoHalfHeight;
  const torsoTopY = torsoY + torsoHalfHeight;
  const headRadius = 0.16;
  const headY = torsoTopY + headRadius;
  const armY = torsoY + 0.16;

  const objects: PresetObject[] = [
    { type: 'group' },
    { type: 'capsule', name: '몸통', parentIndex: 0, geometryParams: { radius: 0.16, length: 0.3 }, position: [0, torsoY, 0] },
    { type: 'sphere', name: '머리', parentIndex: 0, geometryParams: { radius: headRadius }, position: [0, headY, 0] },
    {
      type: 'capsule',
      name: '왼쪽 다리',
      parentIndex: 0,
      geometryParams: { radius: 0.08, length: 0.22 },
      position: [-0.12, legY, 0],
    },
    {
      type: 'capsule',
      name: '오른쪽 다리',
      parentIndex: 0,
      geometryParams: { radius: 0.08, length: 0.22 },
      position: [0.12, legY, 0],
    },
    {
      type: 'capsule',
      name: '왼쪽 팔',
      parentIndex: 0,
      geometryParams: { radius: 0.07, length: 0.28 },
      position: [-0.25, armY, 0],
    },
    {
      type: 'capsule',
      name: '오른쪽 팔',
      parentIndex: 0,
      geometryParams: { radius: 0.07, length: 0.28 },
      position: [0.25, armY, 0],
    },
  ];

  return { id: 'simpleCharacterBody', nameKey: 'simpleCharacterBody', category: 'character', objects };
}

/**
 * PHASE2_SPEC §10.5 복합 프리셋: 루트 group + 유리병(lathe) + 병목 링(torus) + 코르크 마개(cylinder)를
 * 한 번에 생성한다. 목·마개 위치는 병 프로필의 어깨/입구 지점을 기준으로 자동 계산한다.
 */
function createPotionPreset(
  id: string,
  nameKey: AssetPreset['nameKey'],
  profile: LatheProfilePoint[],
): AssetPreset {
  const openingY = getProfileHeight(profile);
  const openingRadius = profile[profile.length - 1]?.radius ?? 0.18;
  const neckY = profile.length >= 2 ? profile[profile.length - 2].y : openingY * 0.85;

  const objects: PresetObject[] = [
    { type: 'group' },
    {
      type: 'lathe',
      name: '유리병',
      parentIndex: 0,
      geometryParams: { profile },
      material: { color: '#7dd3c8', opacity: 0.55, transparent: true, roughness: 0.1 },
    },
    {
      type: 'torus',
      name: '병목 링',
      parentIndex: 0,
      geometryParams: { radius: openingRadius + 0.015, tube: 0.02 },
      position: [0, neckY, 0],
      material: { color: '#b45309', metalness: 0.6, roughness: 0.35 },
    },
    {
      type: 'cylinder',
      name: '코르크 마개',
      parentIndex: 0,
      geometryParams: { radiusTop: openingRadius * 0.85, radiusBottom: openingRadius * 1.05, height: 0.12 },
      position: [0, openingY + 0.06, 0],
      material: { color: '#c08457', roughness: 0.8 },
    },
  ];

  return { id, nameKey, category: 'potion', objects };
}
