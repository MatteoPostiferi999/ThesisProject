export type ModelType = 'instant-mesh' | 'other-model';

export interface Model3D {
  url: string;
  format: string;
  size?: number;
}