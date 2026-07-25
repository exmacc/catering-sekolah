export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${yy}${mm}${dd}-${rand}`;
}

export function getPeriodDates(period: 'daily' | 'weekly' | 'monthly', date: Date = new Date()) {
  if (period === 'daily') {
    return {
      period_start: date.toISOString().split('T')[0],
      period_end: date.toISOString().split('T')[0],
    };
  }
  if (period === 'weekly') {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Saturday
    return {
      period_start: start.toISOString().split('T')[0],
      period_end: end.toISOString().split('T')[0],
    };
  }
  // monthly
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    period_start: start.toISOString().split('T')[0],
    period_end: end.toISOString().split('T')[0],
  };
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
