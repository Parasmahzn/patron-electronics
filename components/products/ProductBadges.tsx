import { Flame, Heart, Sparkles, Star, Tag, TrendingUp, type LucideIcon } from 'lucide-react';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

export type ProductBadgeFlags = {
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isTopSale: boolean;
  isRecommended?: boolean;
  isOnSale: boolean;
};

const BADGE_CONFIG: {
  key: keyof ProductBadgeFlags;
  label: string;
  tone: BadgeTone;
  icon: LucideIcon;
  animationClass: string;
}[] = [
  {
    key: 'isOnSale',
    label: 'Sale',
    tone: 'amber',
    icon: Tag,
    animationClass: 'badge-anim-shimmer',
  },
  { key: 'isNew', label: 'New', tone: 'accent', icon: Sparkles, animationClass: 'badge-anim-pop' },
  {
    key: 'isBestSeller',
    label: 'Best Seller',
    tone: 'primary',
    icon: Flame,
    animationClass: 'badge-anim-bestseller',
  },
  {
    key: 'isTopSale',
    label: 'Top Sale',
    tone: 'primary',
    icon: TrendingUp,
    animationClass: 'badge-anim-pop',
  },
  {
    key: 'isFeatured',
    label: 'Featured',
    tone: 'neutral',
    icon: Star,
    animationClass: 'badge-anim-featured',
  },
  {
    key: 'isRecommended',
    label: 'Popular',
    tone: 'neutral',
    icon: Heart,
    animationClass: 'badge-anim-pop',
  },
];

export function ProductBadges({ flags, max = 2 }: { flags: ProductBadgeFlags; max?: number }) {
  const active = BADGE_CONFIG.filter((badge) => flags[badge.key]).slice(0, max);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map((badge) => (
        <Badge key={badge.key} tone={badge.tone} icon={badge.icon} className={badge.animationClass}>
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
