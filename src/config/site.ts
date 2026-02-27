export const siteConfig = {
  name: 'Tomato Warning',
  tagline: 'Flavor on the Radar.',
  url: 'https://tomatowarning.com',
  brandColors: {
    stormCharcoal: '#2C2C2C',
    premiumWhite: '#F5F0EB',
    radarTeal: '#00B4D8',
  },
  nav: [
    { label: 'Products', href: '/products/' },
    { label: 'Mission', href: '/mission/' },
    { label: 'Privacy', href: '/privacy/' },
  ],
} as const;

export const efColors: Record<number, string> = {
  1: '#D4A017',
  2: '#CC5500',
  3: '#8B2500',
  4: '#5C0A0A',
  5: '#1C0A0A',
};

export type SiteConfig = typeof siteConfig;
