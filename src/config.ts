/// <reference types="vite/client" />

// Global API Configuration
export const RAILWAY_BACKEND = 'https://velaris-production.up.railway.app';

export const API_BASE = (() => {
  if ((import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '';
  }
  return RAILWAY_BACKEND;
})();

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};

