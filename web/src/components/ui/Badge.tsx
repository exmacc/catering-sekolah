import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
  info: 'bg-sky-50 text-sky-700 border-sky-100',
  purple: 'bg-violet-50 text-violet-700 border-violet-100',
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Badge({ children, tone = 'gray', className }: { children: React.ReactNode; tone?: keyof typeof styles; className?: string }) {
  return <span className={cn('chip border', styles[tone], className)}>{children}</span>;
}
