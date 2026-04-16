export function formatCredits(cents: number): string {
  // Convert cents to dollars: 452 → "$4.52"
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatAddress(addr: string): string {
  // "0x1234567890abcdef" → "0x1234...cdef"
  if (!addr || addr.length < 12) return addr || '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatTimeAgo(iso: string): string {
  // ISO timestamp → "2 minutes ago", "3 hours ago", "1 day ago"
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatTokens(n: number): string {
  return n.toLocaleString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function formatTier(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function getTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'premium':
    case 'pro':
      return 'bg-tier-high';
    case 'standard':
    case 'basic':
      return 'bg-tier-normal';
    case 'free':
    default:
      return 'bg-tier-low';
  }
}
