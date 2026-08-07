import { NextResponse, type NextRequest } from 'next/server';
import { getAutocompleteSuggestions } from '@/lib/products/discovery';

// Backs the header search-bar autocomplete. Deliberately returns only a
// small, minimal projection — never the full catalog — per the spec's
// "never download the entire product catalog to the browser" requirement.
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? '';
  const suggestions = await getAutocompleteSuggestions(query);

  return NextResponse.json({
    suggestions: suggestions.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      inStock: product.stock > 0,
      image: product.images[0] ?? null,
    })),
  });
}
