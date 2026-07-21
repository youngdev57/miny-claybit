import type { TranslationSchema } from '@/i18n/types';

/** 향후 다국어 확장을 위한 구조용 미러. 현재 UI에는 연결하지 않는다(Phase 2는 한국어 고정 UI). */
export const en: TranslationSchema = {
  common: {
    add: 'Add',
    delete: 'Delete',
    duplicate: 'Duplicate',
    reset: 'Reset',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
  },

  primitive: {
    box: 'Box',
    roundedBox: 'Rounded Box',
    sphere: 'Sphere',
    capsule: 'Capsule',
    cylinder: 'Cylinder',
    cone: 'Cone',
    plane: 'Plane',
    torus: 'Torus',
    lathe: 'Lathe',
  },

  transform: {
    title: 'Transform',
    position: 'Position',
    rotation: 'Rotation',
    scale: 'Scale',
    move: 'Move',
    rotate: 'Rotate',
    resize: 'Resize',
    fitToGround: 'Fit to Ground',
    moveToOrigin: 'Move to Origin',
    reset: 'Reset Transform',
    mirrorX: 'Mirror X',
  },

  dimensions: {
    title: 'Dimensions',
    width: 'Width',
    height: 'Height',
    depth: 'Depth',
    unit: 'Unit',
    keepRatio: 'Keep Proportions',
    boundingBox: 'Bounding Box',
  },

  material: {
    title: 'Material',
    color: 'Color',
    roughness: 'Roughness',
    metalness: 'Metalness',
    opacity: 'Opacity',
    emissive: 'Emissive',
    emissiveIntensity: 'Emissive Intensity',
    flatShading: 'Flat Shading',
    smoothShading: 'Smooth Shading',
    doubleSided: 'Double Side',
  },

  camera: {
    perspective: 'Perspective',
    orthographic: 'Orthographic',
    front: 'Front',
    back: 'Back',
    left: 'Left',
    right: 'Right',
    top: 'Top',
    bottom: 'Bottom',
    reset: 'Reset Camera',
    focusSelection: 'Focus Selection',
  },

  project: {
    new: 'New Project',
    save: 'Save Project',
    load: 'Load Project',
    reset: 'Reset Project',
    autoSaved: 'Auto Saved',
    exportGlb: 'Export GLB',
  },

  geometry: {
    title: 'Shape',
    quality: {
      low: 'Low Poly',
      medium: 'Standard',
      high: 'Smooth',
    },
    roundedBox: {
      radius: 'Roundness',
    },
    torus: {
      radius: 'Radius',
      tube: 'Tube Thickness',
      radialSegments: 'Radial Quality',
      tubularSegments: 'Tubular Quality',
      arc: 'Arc',
    },
    sphere: {
      widthSegments: 'Width Segments',
      heightSegments: 'Height Segments',
    },
    cylinder: {
      radialSegments: 'Segments',
    },
    cone: {
      radialSegments: 'Segments',
    },
    capsule: {
      capSegments: 'Cap Segments',
      radialSegments: 'Radial Segments',
    },
    lathe: {
      height: 'Height',
      bottomWidth: 'Bottom Width',
      bodyWidth: 'Body Width',
      shoulderWidth: 'Shoulder Width',
      neckWidth: 'Neck Width',
      openingWidth: 'Opening Width',
      segments: 'Curve Quality',
    },
  },

  modifier: {
    taper: {
      title: 'Taper',
      enabled: 'Enabled',
      top: 'Top Width',
      bottom: 'Bottom Width',
    },
    bend: {
      title: 'Bend',
      enabled: 'Enabled',
      axis: 'Axis',
      angle: 'Strength',
      start: 'Start',
      end: 'End',
    },
  },

  preset: {
    title: 'Presets',
    category: {
      character: 'Character',
      potion: 'Potion',
      weapon: 'Weapon',
      prop: 'Prop',
      environment: 'Environment',
    },
    items: {
      shortArm: 'Short Arm',
      shortLeg: 'Short Leg',
      roundHead: 'Round Head',
      pointedEar: 'Pointed Ear',
      smallHorn: 'Small Horn',
      droopyEar: 'Droopy Ear',
      swordBlade: 'Sword Blade',
      handle: 'Handle',
      cork: 'Cork',
      bottleRing: 'Bottle Ring',
      roundBottle: 'Round Bottle',
      tallBottle: 'Tall Bottle',
      jarBottle: 'Jar Bottle',
      basicPotion: 'Basic Potion',
      tallPotion: 'Tall Potion',
      basicSword: 'Basic Sword',
      basicShield: 'Basic Shield',
      slime: 'Slime',
      mushroomMonster: 'Mushroom Monster',
      simpleCharacterBody: 'Simple Character Body',
    },
  },
};
