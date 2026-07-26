import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  success: 'bg-violet-50 text-violet-700 border-violet-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
  info: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Badge({ children, tone = 'gray', className }: { children: React.ReactNode; tone?: keyof typeof styles; className?: string }) {
  return <span className={cn('chip border', styles[tone], className)}>{children}</span>;
}
