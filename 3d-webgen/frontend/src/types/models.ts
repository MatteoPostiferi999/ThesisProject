export type ModelType = 'instant-mesh' | 'other-model';

export interface Model3D {
  url: string;
  format: string;
  size?: number;
}

export type GeneratedModel = {
  id: number;
  input_image: string;
  output_model: string;
  model_name: string;
  created_at: string;
  user: string; // Aggiungi questo campo come stringa
};