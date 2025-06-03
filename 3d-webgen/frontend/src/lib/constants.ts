// src/lib/constants.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  POLLING_INTERVAL: 3000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

export const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'] as const;