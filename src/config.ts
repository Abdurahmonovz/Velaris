/// <reference types="vite/client" />

// Global API Configuration - Railway Backend
export const RAILWAY_BACKEND = 'https://velaris-production.up.railway.app';
export const API_BASE = ((import.meta as any).env?.VITE_API_URL || RAILWAY_BACKEND).replace(/\/$/, '');

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};
