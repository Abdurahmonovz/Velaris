export const getCleanImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';

  // If URL contains /perfumes/perfume_X.jpg, always convert to clean Vercel path with cache buster
  if (url.includes('/perfumes/')) {
    const match = url.match(/\/perfumes\/perfume_\d+\.jpg/);
    if (match) return `${match[0]}?v=2`;
  }

  return url;
};
