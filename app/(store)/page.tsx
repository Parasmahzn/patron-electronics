import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Truck,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { ProductRail } from '@/components/products/ProductRail';
import { getSiteSettings } from '@/lib/settings/settings.service';
import { getActiveCategories } from '@/lib/products/category.service';
import { getActiveServices } from '@/lib/services/service.service';
import { getProductsByFlag, getProductsByType } from '@/lib/products/discovery';
import { getVisibleReviews, getReviewStats } from '@/lib/reviews/review.service';
import { formatCurrency } from '@/lib/utils/format-currency';

const WHY_CHOOSE_US = [
  {
    icon: ShieldCheck,
    title: 'Genuine Parts & Devices',
    description:
      'Every device and repair part we sell is sourced and quality-checked before it reaches you.',
  },
  {
    icon: Wrench,
    title: 'Skilled Repair Technicians',
    description:
      'Mobile and laptop repairs — screens, batteries, charging ports and more — done right the first time.',
  },
  {
    icon: Truck,
    title: 'Cash on Delivery',
    description:
      'Order with confidence and pay only when your device or accessory arrives at your door.',
  },
  {
    icon: Clock,
    title: 'Reliable Turnaround',
    description: 'Clear order and repair tracking so you always know exactly where things stand.',
  },
];

export default async function HomePage() {
  const [
    settings,
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
      {/* Hero */}
      <section className="bg-midnight relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.35),_transparent_55%)]"
        />
        <div className="relative container grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="text-accent inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <Smartphone aria-hidden="true" className="h-3.5 w-3.5" />
              Mobile &amp; Laptop Store and Repair Centre
            </span>
            <h1 className="font-heading mt-5 text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-5xl">
              {settings.heroHeading}
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
              {settings.heroSubheading}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop">
                <Button size="lg">
                  Shop Now
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/repair">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  <Wrench aria-hidden="true" className="h-4 w-4" />
                  Repair Your Device
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden aspect-square items-center justify-center lg:flex">
            <div className="from-primary/30 via-accent/20 absolute inset-0 rounded-full bg-gradient-to-br to-transparent blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur-sm">
                <ShieldCheck aria-hidden="true" className="text-accent h-6 w-6" />
                <p className="font-heading mt-3 text-sm font-semibold">Trusted Local Service</p>
                <p className="mt-1 text-xs text-slate-300">Gokarneshwor, Kathmandu</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur-sm">
                <Wrench aria-hidden="true" className="text-amber h-6 w-6" />
                <p className="font-heading mt-3 text-sm font-semibold">Expert Repairs</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur-sm">
                <Truck aria-hidden="true" className="text-primary-light h-6 w-6" />
                <p className="font-heading mt-3 text-sm font-semibold">Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container py-10 sm:py-12">
          <div className="mb-6 flex items-end justify-between gap-3">
            <h2 className="font-heading text-midnight text-xl font-bold sm:text-2xl">
              Shop by Category
            </h2>
            <Link
              href="/categories"
              className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              View all
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group border-border flex flex-col items-center gap-3 rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
              >
                <div className="bg-surface relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
                  {category.image ? (
                    <Image src={category.image} alt="" fill className="object-cover" />
                  ) : (
                    <Smartphone aria-hidden="true" className="text-primary h-7 w-7" />
                  )}
                </div>
                <span className="text-midnight group-hover:text-primary text-sm font-medium">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
                <div key={review.id} className="border-border rounded-lg border bg-white p-5">
                  <StarRating rating={review.rating} size={14} />
                  <p className="text-midnight mt-3 text-sm">&ldquo;{review.comment}&rdquo;</p>
                  <p className="text-midnight mt-3 text-sm font-semibold">{review.authorName}</p>
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
