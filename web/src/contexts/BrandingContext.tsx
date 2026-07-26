'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export interface Branding {
  business_name: string;
  tagline: string;
  logo_url: string | null;
}

const DEFAULTS: Branding = {
  business_name: 'Catering Sekolah',
  tagline: 'Pesan mudah • Bayar fleksibel',
  logo_url: null,
};

interface BrandingContextType {
  branding: Branding;
  loading: boolean;
  refreshBranding: () => Promise<void>;
  setBrandingLocal: (b: Branding) => void;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: DEFAULTS,
  loading: true,
  refreshBranding: async () => {},
  setBrandingLocal: () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refreshBranding = useCallback(async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      const result = await res.json();
      if (result.success && result.data) {
        setBranding({
          business_name: result.data.business_name || DEFAULTS.business_name,
          tagline: result.data.tagline || DEFAULTS.tagline,
          logo_url: result.data.logo_url || null,
        });
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBranding();
  }, [refreshBranding]);

  useEffect(() => {
    if (typeof document !== 'undefined' && branding.business_name) {
      document.title = branding.business_name;
    }
  }, [branding.business_name]);

  return (
    <BrandingContext.Provider
      value={{
        branding,
        loading,
        refreshBranding,
        setBrandingLocal: setBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
