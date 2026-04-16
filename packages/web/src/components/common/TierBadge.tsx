'use client';

import { cn } from '@/lib/utils';

const tierConfig = {
  high: { label: 'High', className: 'bg-[var(--tier-high)]/20 text-[var(--tier-high)]', dotClass: 'bg-[var(--tier-high)]' },
  normal: { label: 'Normal', className: 'bg-[var(--tier-normal)]/20 text-[var(--tier-normal)]', dotClass: 'bg-[var(--tier-normal)]' },
  low: { label: 'Low Compute', className: 'bg-[var(--tier-low)]/20 text-[var(--tier-low)]', dotClass: 'bg-[var(--tier-low)]' },
  critical: { label: 'Critical', className: 'bg-[var(--tier-critical)]/20 text-[var(--tier-critical)]', dotClass: 'bg-[var(--tier-critical)]' },
  dead: { label: 'Dead', className: 'bg-[var(--tier-dead)]/20 text-[var(--tier-dead)]', dotClass: 'bg-[var(--tier-dead)]' },
};

interface TierBadgeProps {
  tier: keyof typeof tierConfig;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = tierConfig[tier] || tierConfig.normal;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', config.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  );
}
