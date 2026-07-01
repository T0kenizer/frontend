export const NODE_ENV: 'development' | 'production' | 'test' =
  process.env.NODE_ENV || 'development';

export const NEXT_PUBLIC_API_URL: string =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const INTERNAL_API_URL: string =
  process.env.INTERNAL_API_URL || NEXT_PUBLIC_API_URL;
