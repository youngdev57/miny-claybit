export interface TranslationSchema {
  common: {
    add: string;
    delete: string;
    duplicate: string;
    reset: string;
    cancel: string;
    confirm: string;
    close: string;
  };

  primitive: {
    box: string;
    roundedBox: string;
    sphere: string;
    capsule: string;
    cylinder: string;
    cone: string;
    plane: string;
    torus: string;
    lathe: string;
  };

  transform: {
    title: string;
    position: string;
    rotation: string;
    scale: string;
    move: string;
    rotate: string;
    resize: string;
    fitToGround: string;
    moveToOrigin: string;
    reset: string;
    mirrorX: string;
  };

  dimensions: {
    title: string;
    width: string;
    height: string;
    depth: string;
    unit: string;
    keepRatio: string;
    boundingBox: string;
  };

  material: {
    title: string;
    color: string;
    roughness: string;
    metalness: string;
    opacity: string;
    emissive: string;
    emissiveIntensity: string;
    flatShading: string;
    smoothShading: string;
    doubleSided: string;
  };

  camera: {
    perspective: string;
    orthographic: string;
    front: string;
    back: string;
    left: string;
    right: string;
    top: string;
    bottom: string;
    reset: string;
    focusSelection: string;
  };

  project: {
    new: string;
    save: string;
    load: string;
    reset: string;
    autoSaved: string;
    exportGlb: string;
  };

  geometry: {
    title: string;
    quality: {
      low: string;
      medium: string;
      high: string;
    };
    roundedBox: {
      radius: string;
    };
    torus: {
      radius: string;
      tube: string;
      radialSegments: string;
      tubularSegments: string;
      arc: string;
    };
    sphere: {
      widthSegments: string;
      heightSegments: string;
    };
    cylinder: {
      radialSegments: string;
    };
    cone: {
      radialSegments: string;
    };
    capsule: {
      capSegments: string;
      radialSegments: string;
    };
    lathe: {
      height: string;
      bottomWidth: string;
      bodyWidth: string;
      shoulderWidth: string;
      neckWidth: string;
      openingWidth: string;
      segments: string;
    };
  };

  modifier: {
    taper: {
      title: string;
      enabled: string;
      top: string;
      bottom: string;
    };
    bend: {
      title: string;
      enabled: string;
      axis: string;
      angle: string;
      start: string;
      end: string;
    };
  };

  preset: {
    title: string;
    category: {
      character: string;
      potion: string;
      weapon: string;
      prop: string;
      environment: string;
    };
    items: {
      shortArm: string;
      shortLeg: string;
      roundHead: string;
      pointedEar: string;
      smallHorn: string;
      droopyEar: string;
      swordBlade: string;
      handle: string;
      cork: string;
      bottleRing: string;
      roundBottle: string;
      tallBottle: string;
      jarBottle: string;
      basicPotion: string;
      tallPotion: string;
      basicSword: string;
      basicShield: string;
      slime: string;
      mushroomMonster: string;
      simpleCharacterBody: string;
    };
  };
}
