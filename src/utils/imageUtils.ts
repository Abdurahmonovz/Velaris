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
 * Prevents 404 errors caused by missing leading slashes, escaped quotes, or stringified arrays.
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

  // If full HTTP/HTTPS URL
  if (/^https?:\/\//i.test(cleanUrl)) {
    // If pointing to localhost/127.0.0.1, convert to live Railway backend
    if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
      const perfumesMatch = cleanUrl.match(/\/perfumes\/[^\/\?#]+/);
      if (perfumesMatch) return `${RAILWAY_BACKEND}${perfumesMatch[0]}`;
    }
    return cleanUrl;
  }

  // Ensure leading slash
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }

  // Route /perfumes/ static assets directly to Railway server URL
  if (cleanUrl.startsWith('/perfumes/')) {
    return `${RAILWAY_BACKEND}${cleanUrl}`;
  }

  return cleanUrl;
};


