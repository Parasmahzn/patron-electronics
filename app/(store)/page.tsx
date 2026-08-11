import Link from 'next/link';
import { ArrowRight, CheckCircle2, MapPin, Phone, Quote, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { Avatar } from '@/components/ui/Avatar';
import { ProductRail } from '@/components/products/ProductRail';
import { HeroSection } from '@/components/storefront/HeroSection';
import { CategoryScroller } from '@/components/storefront/CategoryScroller';
import { getSiteSettings } from '@/lib/settings/settings.service';
import { getActiveCategories } from '@/lib/products/category.service';
import { getActiveServices } from '@/lib/services/service.service';
import { getActiveBanners } from '@/lib/banners/banner.service';
import { getProductsByFlag, getProductsByType } from '@/lib/products/discovery';
import { getVisibleReviews, getReviewStats } from '@/lib/reviews/review.service';
import { formatCurrency } from '@/lib/utils/format-currency';
import { WHY_CHOOSE_US } from '@/config/storefront-content';

export default async function HomePage() {
  const [
    settings,
    banners,
    categories,
    newArrivals,
    featured,
    bestSellers,
    topSales,
    accessories,
    gadgets,
    services,
    reviews,
    reviewStats,
  ] = await Promise.all([
    getSiteSettings(),
    getActiveBanners(),
    getActiveCategories(),
    getProductsByFlag('isNew'),
    getProductsByFlag('isFeatured'),
    getProductsByFlag('isBestSeller'),
    getProductsByFlag('isTopSale'),
    getProductsByType('ACCESSORY'),
    getProductsByType('GADGET'),
    getActiveServices(),
    getVisibleReviews(6),
    getReviewStats(),
  ]);

  return (
    <>
      <HeroSection
        heading={settings.heroHeading}
        subheading={settings.heroSubheading}
        banners={banners}
      />

      {categories.length > 0 && <CategoryScroller categories={categories} />}

      <ProductRail
        title="New Arrivals"
        subtitle="Just landed in our store"
        products={newArrivals}
        viewAllHref="/shop?sort=newest"
      />
      <ProductRail
        title="Featured Products"
        subtitle="Handpicked by our team"
        products={featured}
        viewAllHref="/shop?sort=featured"
      />
      <ProductRail
        title="Best Sellers"
        subtitle="What customers love most"
        products={bestSellers}
        viewAllHref="/shop?sort=most-sold"
      />
      <ProductRail
        title="Top Sales"
        subtitle="Great deals, limited time"
        products={topSales}
        viewAllHref="/shop?type=MOBILE"
      />
      <ProductRail title="Accessories" products={accessories} viewAllHref="/shop?type=ACCESSORY" />
      <ProductRail title="Gadgets" products={gadgets} viewAllHref="/shop?type=GADGET" />

      {/* Repair services teaser */}
      {services.length > 0 && (
        <section className="bg-surface py-12 sm:py-16">
          <div className="container">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-midnight text-xl font-bold sm:text-2xl">
                  Repair Services
                </h2>
                <p className="text-muted mt-1 text-sm">
                  Screens, batteries, charging ports, water damage and more.
                </p>
              </div>
              <Link
                href="/services"
                className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                View all services
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((service) => (
                <div key={service.id} className="border-border rounded-lg border bg-white p-5">
                  <Wrench aria-hidden="true" className="text-primary h-6 w-6" />
                  <h3 className="font-heading text-midnight mt-3 text-base font-semibold">
                    {service.name}
                  </h3>
                  <p className="text-muted mt-1 line-clamp-2 text-sm">{service.shortDescription}</p>
                  {service.startingPrice && (
                    <p className="text-primary mt-2 text-sm font-semibold">
                      Starting at {formatCurrency(service.startingPrice)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/repair">
                <Button size="lg">
                  <Wrench aria-hidden="true" className="h-4 w-4" />
                  Book a Repair
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why choose us */}
      <section className="container py-12 sm:py-16">
        <h2 className="font-heading text-midnight text-center text-xl font-bold sm:text-2xl">
          Why Choose {settings.businessName}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE_US.map((item) => (
            <div
              key={item.title}
              className="border-border rounded-lg border bg-white p-5 text-center"
            >
              <item.icon aria-hidden="true" className="text-primary mx-auto h-8 w-8" />
              <h3 className="font-heading text-midnight mt-3 text-sm font-semibold">
                {item.title}
              </h3>
              <p className="text-muted mt-1.5 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="bg-surface py-12 sm:py-16">
          <div className="container">
            <div className="text-center">
              <h2 className="font-heading text-midnight text-xl font-bold sm:text-2xl">
                What Our Customers Say
              </h2>
              <div className="mt-3 flex items-center justify-center gap-2">
                <StarRating rating={reviewStats.averageRating} />
                <span className="text-midnight text-sm font-semibold">
                  {reviewStats.averageRating.toFixed(1)} / 5
                </span>
                <span className="text-muted text-sm">
                  ({reviewStats.reviewCount} review{reviewStats.reviewCount === 1 ? '' : 's'})
                </span>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-border relative rounded-lg border bg-white p-5"
                >
                  <Quote
                    aria-hidden="true"
                    className="text-primary-light absolute top-4 right-4 h-8 w-8"
                  />
                  <StarRating rating={review.rating} size={14} />
                  <p className="text-midnight relative mt-3 text-sm">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar name={review.authorName} size={36} />
                    <p className="text-midnight text-sm font-semibold">{review.authorName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="bg-midnight py-12 sm:py-16">
        <div className="container flex flex-col items-center gap-5 text-center">
          <CheckCircle2 aria-hidden="true" className="text-accent h-8 w-8" />
          <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
            Ready to upgrade your device or get it fixed?
          </h2>
          <p className="max-w-xl text-sm text-slate-300">
            Browse our catalog of mobiles, laptops, and accessories, or book a repair with our
            technicians today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop">
              <Button size="lg">Shop Now</Button>
            </Link>
            <Link href="/repair">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Book a Repair
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact snippet */}
      <section className="container py-10">
        <div className="border-border flex flex-col gap-4 rounded-lg border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MapPin aria-hidden="true" className="text-primary mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-midnight text-sm font-semibold">Visit our store</p>
              <p className="text-muted text-sm">{settings.address}</p>
            </div>
          </div>
          <a
            href={`tel:${settings.phone}`}
            className="border-border text-midnight hover:bg-surface inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium"
          >
            <Phone aria-hidden="true" className="text-primary h-4 w-4" />
            {settings.phone}
          </a>
        </div>
      </section>
    </>
  );
}
