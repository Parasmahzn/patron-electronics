export const SITE_NAME = 'Patron Electronics';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_DESCRIPTION =
  'Mobile phones, laptops, accessories, and gadgets in Gokarneshwor, Kathmandu — plus expert mobile and laptop repair services.';

export const DEFAULT_PAGE_SIZE = 24;
export const AUTOCOMPLETE_LIMIT = 8;
export const RELATED_PRODUCTS_LIMIT = 4;
export const MAX_CART_QUANTITY = 20;

export const DELIVERY_FEE = 100;
export const FREE_DELIVERY_THRESHOLD = 5000;

export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;

export const SESSION_COOKIE_NAME = 'pe_admin_session';
export const SESSION_DURATION_DAYS = 7;

export const ADMIN_IDLE_TIMEOUT_MINUTES = 10;
export const ADMIN_IDLE_WARNING_SECONDS = 30;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/categories', label: 'Categories' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  MOBILE: 'Mobile',
  LAPTOP: 'Laptop',
  ACCESSORY: 'Accessories',
  GADGET: 'Gadgets',
};

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most-sold', label: 'Most Sold' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];
