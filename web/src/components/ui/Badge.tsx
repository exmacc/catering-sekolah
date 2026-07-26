import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  success: 'bg-blue-50 text-blue-700 border-blue-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
  info: 'bg-sky-50 text-sky-700 border-sky-100',
  purple: 'bg-blue-50 text-blue-700 border-blue-100',
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Badge({ children, tone = 'gray', className }: { children: React.ReactNode; tone?: keyof typeof styles; className?: string }) {
  return <span className={cn('chip border', styles[tone], className)}>{children}</span>;
}
