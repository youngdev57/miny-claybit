import type { LatheProfilePoint } from '@/features/editor/types/scene';

/** PHASE2_SPEC §6.5 기본 프로필. */
export const DEFAULT_POTION_PROFILE: LatheProfilePoint[] = [
  { y: 0.0, radius: 0.22 },
  { y: 0.08, radius: 0.32 },
  { y: 0.35, radius: 0.42 },
  { y: 0.6, radius: 0.4 },
  { y: 0.76, radius: 0.26 },
  { y: 0.95, radius: 0.16 },
  { y: 1.1, radius: 0.18 },
];

/**
 * 고정 7점 토폴로지의 인덱스. PHASE2_SPEC §6.7 "MVP형 회전체 편집"에 따라 자유 제어점 추가·삭제는
 * 지원하지 않고, 이 고정된 지점들의 반지름/전체 높이만 슬라이더로 조절한다.
 */
export const LATHE_POINT = {
  bottom: 0,
  lowerBody: 1,
  body: 2,
  bodyTop: 3,
  shoulder: 4,
  neck: 5,
  opening: 6,
} as const;

export function getProfileHeight(profile: LatheProfilePoint[]): number {
  return profile.reduce((max, point) => Math.max(max, point.y), 0);
}

/** 바닥(y=0)을 기준으로 나머지 점들의 y를 비례 확대/축소해 전체 높이를 바꾼다. */
export function scaleProfileHeight(profile: LatheProfilePoint[], newHeight: number): LatheProfilePoint[] {
  const currentHeight = getProfileHeight(profile);
  const safeHeight = Math.max(0.05, newHeight);
  if (currentHeight <= 0) return profile;
  const ratio = safeHeight / currentHeight;
  return profile.map((point) => ({ ...point, y: point.y * ratio }));
}

/**
 * 지정한 인덱스의 폭(radius)만 바꾼다. 몸통 폭(body)을 바꿀 때는 아래 몸통(lowerBody) 지점도
 * 기본 프로필과 같은 비율로 함께 조절해 형태가 어색해지지 않도록 한다.
 */
export function setProfileRadius(profile: LatheProfilePoint[], index: number, radius: number): LatheProfilePoint[] {
  const safeRadius = Math.max(0.01, radius);
  const next = profile.map((point, i) => (i === index ? { ...point, radius: safeRadius } : point));

  if (index === LATHE_POINT.body && next[LATHE_POINT.lowerBody]) {
    const ratio = DEFAULT_POTION_PROFILE[LATHE_POINT.lowerBody].radius / DEFAULT_POTION_PROFILE[LATHE_POINT.body].radius;
    next[LATHE_POINT.lowerBody] = { ...next[LATHE_POINT.lowerBody], radius: Math.max(0.01, safeRadius * ratio) };
  }

  return next;
}

/** 포션 회전체 프리셋(PHASE2_SPEC §10.2)에 사용할 병 모양 변형. */
export const BOTTLE_PROFILES: Record<'round' | 'tall' | 'jar', LatheProfilePoint[]> = {
  round: DEFAULT_POTION_PROFILE,
  tall: [
    { y: 0.0, radius: 0.2 },
    { y: 0.1, radius: 0.26 },
    { y: 0.55, radius: 0.3 },
    { y: 1.0, radius: 0.29 },
    { y: 1.25, radius: 0.2 },
    { y: 1.55, radius: 0.12 },
    { y: 1.75, radius: 0.14 },
  ],
  jar: [
    { y: 0.0, radius: 0.34 },
    { y: 0.06, radius: 0.42 },
    { y: 0.3, radius: 0.46 },
    { y: 0.55, radius: 0.44 },
    { y: 0.68, radius: 0.34 },
    { y: 0.78, radius: 0.26 },
    { y: 0.86, radius: 0.28 },
  ],
};
