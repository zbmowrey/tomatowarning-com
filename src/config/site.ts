export interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

export const siteConfig = {
  name: 'Tomato Warning',
  tagline: 'Chase the storm.',
  url: 'https://tomatowarning.com',
  brandColors: {
    stormCharcoal: '#2C2C2C',
    premiumWhite: '#F5F0EB',
    radarTeal: '#00B4D8',
  },
  nav: [
    { label: 'Products', href: '/products/' },
    { label: 'Our Story', href: '/our-story/' },
    { label: 'Mission', href: '/mission/' },
    { label: 'Retailers', href: '/retailers/' },
    { label: 'Fundraisers', href: '/fundraisers/' },
    {
      label: 'More',
      children: [
        { label: 'Press', href: '/press/' },
        { label: 'Distributors', href: '/distributors/' },
      ],
    },
  ] satisfies NavItem[],
} as const;

export const efColors: Record<number, string> = {
  1: '#D4A017',
  2: '#CC5500',
  3: '#8B2500',
  4: '#5C0A0A',
  5: '#1C0A0A',
};

export type SiteConfig = typeof siteConfig;
