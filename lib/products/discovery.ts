import 'server-only';
import { prisma } from '@/lib/db/client';
import { Prisma, type ProductType } from '@/lib/generated/prisma/client';
import { DEFAULT_PAGE_SIZE, AUTOCOMPLETE_LIMIT, RELATED_PRODUCTS_LIMIT } from '@/config/site';
import type { ProductSearchInput } from '@/lib/validations/search';

export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  brand: true,
  price: true,
  discountPrice: true,
  stock: true,
  isNew: true,
  isFeatured: true,
  isBestSeller: true,
  isTopSale: true,
  isOnSale: true,
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true, alt: true },
  },
} satisfies Prisma.ProductSelect;

export type ProductCard = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

/**
 * Builds the shared WHERE clause for every storefront product listing
 * (shop, search, categories, homepage rails) so filtering logic is defined
 * once and reused everywhere, per the "Product Discovery" module in the
 * spec rather than duplicated per page.
 */
export function buildProductWhere(filters: ProductSearchInput): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.q) {
    const q = filters.q;
    where.OR = [
      { name: { contains: q } },
      { brand: { contains: q } },
      { sku: { contains: q } },
      { tags: { contains: q } },
      { shortDescription: { contains: q } },
      { description: { contains: q } },
    ];
  }

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.brand) {
    where.brand = filters.brand;
  }

  if (filters.type) {
    where.productType = filters.type;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.availability === 'in-stock') {
    where.stock = { gt: 0 };
  } else if (filters.availability === 'out-of-stock') {
    where.stock = { lte: 0 };
  }

  return where;
}

// "most-sold" and "popular" both rank by how many times a product has been
// ordered (via the OrderItem relation count). This intentionally counts all
// historical order items, including cancelled orders — a precise
// cancelled-order-excluded ranking would require a separate aggregation
// pass that can't be combined with paginated relational filtering in a
// single query. Manually curated `isBestSeller`/`isRecommended` flags
// (used on the homepage) remain the authoritative "best sellers" signal.
export function buildProductOrderBy(
  sort: ProductSearchInput['sort'],
): Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'newest':
      return { createdAt: 'desc' };
    case 'oldest':
      return { createdAt: 'asc' };
    case 'price-asc':
      return { price: 'asc' };
    case 'price-desc':
      return { price: 'desc' };
    case 'featured':
      return [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    case 'most-sold':
    case 'popular':
      return [{ orderItems: { _count: 'desc' } }, { createdAt: 'desc' }];
    case 'relevance':
    default:
      return { createdAt: 'desc' };
  }
}

export async function getProducts(filters: ProductSearchInput) {
  const page = filters.page ?? 1;
  const take = DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * take;

  const where = buildProductWhere(filters);
  const orderBy = buildProductOrderBy(filters.sort);

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take, select: productCardSelect }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / take)),
    page,
    pageSize: take,
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      specifications: { orderBy: { displayOrder: 'asc' } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function getRelatedProducts(categoryId: number, excludeProductId: number) {
  return prisma.product.findMany({
    where: { categoryId, isActive: true, id: { not: excludeProductId } },
    select: productCardSelect,
    take: RELATED_PRODUCTS_LIMIT,
    orderBy: { createdAt: 'desc' },
  });
}

export type AutocompleteSuggestion = Prisma.ProductGetPayload<{
  select: {
    id: true;
    slug: true;
    name: true;
    price: true;
    discountPrice: true;
    stock: true;
    images: { select: { url: true; alt: true } };
  };
}>;

export async function getAutocompleteSuggestions(query: string): Promise<AutocompleteSuggestion[]> {
  const q = query.trim();
  if (!q) return [];

  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ name: { contains: q } }, { brand: { contains: q } }, { sku: { contains: q } }],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      discountPrice: true,
      stock: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
    },
    take: AUTOCOMPLETE_LIMIT,
    orderBy: { createdAt: 'desc' },
  });
}

type ProductFlag =
  'isNew' | 'isFeatured' | 'isBestSeller' | 'isTopSale' | 'isRecommended' | 'isOnSale';

export async function getProductsByFlag(flag: ProductFlag, limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, [flag]: true },
    select: productCardSelect,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProductsByType(type: ProductType, limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, productType: type },
    select: productCardSelect,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAvailableBrands(categorySlug?: string): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    select: { brand: true },
    distinct: ['brand'],
    orderBy: { brand: 'asc' },
  });
  return rows.map((r) => r.brand);
}
