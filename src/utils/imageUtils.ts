import { RAILWAY_BACKEND } from '../config';

export const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';

/**
 * Safely parses images property into a clean array of image strings.
 * Handles stringified JSON arrays, single strings, null/undefined, and arrays.
 */
export const getProductImages = (rawImages: any): string[] => {
  if (!rawImages) return [];

  if (Array.isArray(rawImages)) {
    return rawImages.filter((img) => typeof img === 'string' && img.trim().length > 0);
  }

  if (typeof rawImages === 'string') {
    const trimmed = rawImages.trim();
    if (!trimmed || trimmed === '[]' || trimmed === 'null' || trimmed === 'undefined') {
      return [];
    }

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((img) => typeof img === 'string' && img.trim().length > 0);
        }
      } catch {
        const cleaned = trimmed.replace(/^\[|\]$/g, '').replace(/["']/g, '').trim();
        if (cleaned) return [cleaned];
      }
    }
    return [trimmed];
  }

  return [];
};

/**
 * Formats image URL to guarantee a valid absolute or root-relative URL.
 * Prefers ultra-fast Vercel Edge CDN root-relative static paths for zero latency.
 */
export const getCleanImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string') return FALLBACK_PRODUCT_IMAGE;

  let cleanUrl = url.trim();

  // Strip brackets, quotes or unwanted JSON artifacts if passed as raw string
  cleanUrl = cleanUrl.replace(/^["'\[]+|["'\]]+$/g, '').trim();

  if (!cleanUrl || cleanUrl === 'null' || cleanUrl === 'undefined') {
    return FALLBACK_PRODUCT_IMAGE;
  }

  // If already base64 or blob URL, return as is
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }

  // Extract relative /perfumes/ static path for instant Vercel Edge CDN loading (5ms)
  if (cleanUrl.includes('/perfumes/')) {
    const perfumesMatch = cleanUrl.match(/\/perfumes\/[^\/\?#]+/);
    if (perfumesMatch) return perfumesMatch[0];
  }

  if (cleanUrl.includes('perfumes/')) {
    const perfumesMatch = cleanUrl.match(/perfumes\/[^\/\?#]+/);
    if (perfumesMatch) return '/' + perfumesMatch[0];
  }

  // If full HTTP/HTTPS URL (non-perfume external image)
  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }

  // Ensure leading slash
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }

  return cleanUrl;
};

/**
 * Smart error handler for image <img> tags.
 * Tries Vercel Edge CDN -> Railway Backend -> Unsplash Fallback seamlessly.
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  const currentSrc = target.src || '';

  if (!target.dataset.triedRailway && currentSrc.includes('/perfumes/')) {
    target.dataset.triedRailway = 'true';
    const match = currentSrc.match(/\/perfumes\/[^\/\?#]+/);
    if (match) {
      target.src = `${RAILWAY_BACKEND}${match[0]}`;
      return;
    }
  }

  target.src = FALLBACK_PRODUCT_IMAGE;
};

/**
 * Background preloader for smooth instant rendering.
 */
export const preloadImages = (urls: string[]) => {
  if (typeof window === 'undefined') return;
  urls.forEach((url) => {
    if (!url) return;
    const clean = getCleanImageUrl(url);
    const img = new Image();
    img.src = clean;
  });
};




