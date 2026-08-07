import { getRelatedProducts } from '@/lib/products/discovery';
import { ProductCard } from '@/components/products/ProductCard';

type Props = {
  categoryId: number;
  excludeProductId: number;
};

export async function RelatedProducts({ categoryId, excludeProductId }: Props) {
  const products = await getRelatedProducts(categoryId, excludeProductId);
  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-heading text-midnight text-xl font-bold sm:text-2xl">Related Products</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
