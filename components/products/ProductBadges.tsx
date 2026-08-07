import { Badge, type BadgeTone } from '@/components/ui/Badge';

export type ProductBadgeFlags = {
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isTopSale: boolean;
  isRecommended?: boolean;
  isOnSale: boolean;
};

const BADGE_CONFIG: { key: keyof ProductBadgeFlags; label: string; tone: BadgeTone }[] = [
  { key: 'isOnSale', label: 'Sale', tone: 'amber' },
  { key: 'isNew', label: 'New', tone: 'accent' },
  { key: 'isBestSeller', label: 'Best Seller', tone: 'primary' },
  { key: 'isTopSale', label: 'Top Sale', tone: 'primary' },
  { key: 'isFeatured', label: 'Featured', tone: 'neutral' },
  { key: 'isRecommended', label: 'Popular', tone: 'neutral' },
];

export function ProductBadges({ flags, max = 2 }: { flags: ProductBadgeFlags; max?: number }) {
  const active = BADGE_CONFIG.filter((badge) => flags[badge.key]).slice(0, max);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map((badge) => (
        <Badge key={badge.key} tone={badge.tone}>
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
