/// <reference types="vite/client" />

// Global API Configuration
export const API_BASE = ((import.meta as any).env?.VITE_API_URL || '').replace(/\/$/, '');

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};
