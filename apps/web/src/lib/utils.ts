import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '00:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'RECEIVED':
      return { label: 'In Storage', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'SCHEDULED':
      return { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    case 'ASSIGNED':
      return { label: 'Assigned', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    case 'OUT_FOR_DELIVERY':
      return { label: 'Out for Delivery', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse' };
    case 'DELIVERED':
      return { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'CANCELLED':
      return { label: 'Cancelled', color: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' };
    case 'UNCLAIMED':
      return { label: 'Unclaimed', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    default:
      return { label: status, color: 'bg-white/5 text-neutral-300 border-white/10' };
  }
}

