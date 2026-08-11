import Link from 'next/link';
import { ArrowRight, ShieldCheck, Smartphone, Truck, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BannerCarousel, type Banner } from '@/components/storefront/BannerCarousel';

/**
 * The banner slider leads (wider column, first on every breakpoint — it's
 * the eye-catching promo content) with the identity/trust statement
 * (heading, subheading, primary CTAs) as the narrower second column; that
 * text is always rendered independent of whether any homepage banners
 * exist, since it's who the business is, not a promotion. With zero
 * banners the slider's slot falls back to a decorative "why trust us" card
 * grid instead, visible lg+ only, so a fresh install with no banners still
 * looks complete (and mobile just shows the text alone, as before).
 */
export function HeroSection({
  heading,
  subheading,
  banners,
}: {
  heading: string;
  subheading: string;
  banners: Banner[];
}) {
  return (
    <section className="bg-midnight relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.35),_transparent_55%)]"
      />
      <div className="relative container grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-5 lg:py-28">
        {banners.length > 0 ? (
          <div className="w-full lg:col-span-3">
            <BannerCarousel banners={banners} />
          </div>
        ) : (
          <div className="relative hidden aspect-square items-center justify-center lg:col-span-3 lg:flex">
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
        )}

        <div className="lg:col-span-2">
          <span className="text-accent inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <Smartphone aria-hidden="true" className="h-3.5 w-3.5" />
            Mobile &amp; Laptop Store and Repair Centre
          </span>
          <h1 className="font-heading mt-5 text-3xl leading-tight font-bold text-white sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">{subheading}</p>
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
      </div>
    </section>
  );
}
