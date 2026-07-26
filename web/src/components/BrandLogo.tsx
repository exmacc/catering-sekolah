'use client';

import { useBranding } from '@/contexts/BrandingContext';

export function BrandLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  const { branding } = useBranding();

  if (branding.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={branding.logo_url}
        alt={branding.business_name}
        width={size}
        height={size}
        className={`shrink-0 rounded-2xl object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      🍱
    </div>
  );
}
