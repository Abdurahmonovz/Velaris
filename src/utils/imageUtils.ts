import { RAILWAY_BACKEND } from '../config';

export const getCleanImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';

  if (url.startsWith('/perfumes/')) {
    return `${RAILWAY_BACKEND}${url}`;
  }

  if (url.includes('/perfumes/perfume_')) {
    const match = url.match(/\/perfumes\/perfume_\d+\.jpg/);
    if (match) return `${RAILWAY_BACKEND}${match[0]}`;
  }

  return url;
};
