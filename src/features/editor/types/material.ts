export interface MaterialState {
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  transparent: boolean;
  emissive: string;
  emissiveIntensity: number;
  flatShading: boolean;
  doubleSided: boolean;
}

export const defaultMaterial: MaterialState = {
  color: '#d9d9d9',
  roughness: 0.7,
  metalness: 0,
  opacity: 1,
  transparent: false,
  emissive: '#000000',
  emissiveIntensity: 0,
  flatShading: false,
  doubleSided: false,
};
