'use client';

import { Search } from 'lucide-react';
import { useT } from 'next-i18next/client';
import InputField from './ui/InputField';

interface TrackFormProps {
  formData: { orderId: string; phone: string };
  loading: boolean;
  onChange: (field: 'orderId' | 'phone', value: string) => void;
  onSubmit: () => void;
}

export default function TrackForm({ formData, loading, onChange, onSubmit }: TrackFormProps) {
  const { t } = useT('tracking');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="bg-white p-6 sm:p-8 mb-8"
    >
      <p className="text-[#6A6A6A] text-sm mb-6 leading-relaxed">{t('description')}</p>

      <div className="space-y-4 mb-6">
        <InputField
          label={t('orderId')}
          value={formData.orderId}
          onChange={(e) => onChange('orderId', e.target.value)}
          placeholder="e.g. LNL-ABC123-XY"
          required
        />
        <InputField
          label={t('phone')}
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="Số điện thoại đã dùng thanh toán"
          type="tel"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-4 text-xs uppercase tracking-widest hover:bg-[#333] disabled:bg-[#6A6A6A] transition-colors"
      >
        {loading ? (
          <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Search className="size-4" /> {t('trackButton')}
          </>
        )}
      </button>
    </form>
  );
}
