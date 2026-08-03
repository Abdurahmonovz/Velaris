export const getCleanImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';

  // Return clean Vercel relative static path for ultra-fast Vercel Edge CDN loading
  if (url.includes('/perfumes/')) {
    const match = url.match(/\/perfumes\/perfume_\d+\.jpg/);
    if (match) return match[0];
  }

  return url;
};
