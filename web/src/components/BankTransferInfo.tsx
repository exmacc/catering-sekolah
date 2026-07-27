'use client';

import { useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { formatRupiah } from '@/lib/utils';

export function BankTransferInfo({ amount }: { amount?: number }) {
  const { branding } = useBranding();
  const [copied, setCopied] = useState(false);

  const hasBank =
    branding.bank_name?.trim() ||
    branding.bank_account_number?.trim() ||
    branding.bank_account_name?.trim();

  if (!hasBank) {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        Nomor rekening belum diatur admin. Hubungi admin untuk info transfer.
      </div>
    );
  }

  async function copyNumber() {
    if (!branding.bank_account_number) return;
    try {
      await navigator.clipboard.writeText(branding.bank_account_number.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950">
      <div className="mb-2 font-bold text-blue-900">Transfer ke rekening</div>
      <div className="space-y-1">
        {branding.bank_name && (
          <div>
            <span className="text-blue-700">Bank:</span> <b>{branding.bank_name}</b>
          </div>
        )}
        {branding.bank_account_number && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-blue-700">No. Rek:</span>
            <b className="font-mono text-base tracking-wide">{branding.bank_account_number}</b>
            <button
              type="button"
              onClick={copyNumber}
              className="rounded-lg border border-blue-200 bg-white px-2 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              {copied ? 'Disalin ✓' : 'Salin'}
            </button>
          </div>
        )}
        {branding.bank_account_name && (
          <div>
            <span className="text-blue-700">a.n.</span> <b>{branding.bank_account_name}</b>
          </div>
        )}
        {typeof amount === 'number' && amount > 0 && (
          <div className="mt-2 border-t border-blue-100 pt-2">
            <span className="text-blue-700">Jumlah transfer:</span>{' '}
            <b className="text-base text-blue-800">{formatRupiah(amount)}</b>
          </div>
        )}
      </div>
    </div>
  );
}
