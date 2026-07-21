import type { TranslationSchema } from '@/i18n/types';

export const ko: TranslationSchema = {
  common: {
    add: '추가',
    delete: '삭제',
    duplicate: '복제',
    reset: '초기화',
    cancel: '취소',
    confirm: '확인',
    close: '닫기',
  },

  primitive: {
    box: '상자',
    roundedBox: '둥근 상자',
    sphere: '구',
    capsule: '캡슐',
    cylinder: '원기둥',
    cone: '원뿔',
    plane: '평면',
    torus: '링',
    lathe: '회전체',
  },

  transform: {
    title: '변형',
    position: '위치',
    rotation: '회전',
    scale: '크기 비율',
    move: '이동',
    rotate: '회전',
    resize: '크기 조절',
    fitToGround: '바닥에 맞추기',
    moveToOrigin: '원점으로 이동',
    reset: '변형 초기화',
    mirrorX: '좌우 대칭 복제',
  },

  dimensions: {
    title: '실제 크기',
    width: '너비',
    height: '높이',
    depth: '깊이',
    unit: '단위',
    keepRatio: '비율 유지',
    boundingBox: '크기 상자',
  },

  material: {
    title: '재질',
    color: '색상',
    roughness: '거칠기',
    metalness: '금속성',
    opacity: '불투명도',
    emissive: '발광 색상',
    emissiveIntensity: '발광 강도',
    flatShading: '각진 표면',
    smoothShading: '부드러운 표면',
    doubleSided: '양면 표시',
  },

  camera: {
    perspective: '원근 보기',
    orthographic: '직교 보기',
    front: '정면',
    back: '후면',
    left: '왼쪽',
    right: '오른쪽',
    top: '위',
    bottom: '아래',
    reset: '시점 초기화',
    focusSelection: '선택 객체에 맞추기',
  },

  project: {
    new: '새 프로젝트',
    save: '프로젝트 저장',
    load: '프로젝트 불러오기',
    reset: '프로젝트 초기화',
    autoSaved: '자동 저장됨',
    exportGlb: 'GLB로 내보내기',
  },

  geometry: {
    title: '형태',
    quality: {
      low: '저폴리',
      medium: '기본',
      high: '부드러움',
    },
    roundedBox: {
      radius: '둥글기',
    },
    torus: {
      radius: '전체 반지름',
      tube: '링 굵기',
      radialSegments: '원형 품질',
      tubularSegments: '단면 품질',
      arc: '열림 각도',
    },
    sphere: {
      widthSegments: '가로 분할',
      heightSegments: '세로 분할',
    },
    cylinder: {
      radialSegments: '분할 수',
    },
    cone: {
      radialSegments: '분할 수',
    },
    capsule: {
      capSegments: '끝단 분할',
      radialSegments: '둘레 분할',
    },
    lathe: {
      height: '전체 높이',
      bottomWidth: '바닥 폭',
      bodyWidth: '몸통 폭',
      shoulderWidth: '어깨 폭',
      neckWidth: '병목 폭',
      openingWidth: '입구 폭',
      segments: '곡면 품질',
    },
  },

  modifier: {
    taper: {
      title: '테이퍼',
      enabled: '사용',
      top: '위쪽 굵기',
      bottom: '아래쪽 굵기',
    },
    bend: {
      title: '휘어짐',
      enabled: '사용',
      axis: '방향',
      angle: '강도',
      start: '시작 위치',
      end: '끝 위치',
    },
  },

  preset: {
    title: '프리셋',
    category: {
      character: '캐릭터',
      potion: '포션',
      weapon: '무기',
      prop: '소품',
      environment: '환경',
    },
    items: {
      shortArm: '짧은 팔',
      shortLeg: '짧은 다리',
      roundHead: '둥근 머리',
      pointedEar: '뾰족한 귀',
      smallHorn: '작은 뿔',
      droopyEar: '늘어진 귀',
      swordBlade: '검날',
      handle: '손잡이',
      cork: '코르크',
      bottleRing: '병목 링',
      roundBottle: '둥근 병',
      tallBottle: '긴 병',
      jarBottle: '항아리형 병',
      basicPotion: '기본 포션',
      tallPotion: '긴 포션',
      basicSword: '기본 검',
      basicShield: '기본 방패',
      slime: '슬라임',
      mushroomMonster: '버섯 몬스터',
      simpleCharacterBody: '간단한 캐릭터 몸체',
    },
  },
};
