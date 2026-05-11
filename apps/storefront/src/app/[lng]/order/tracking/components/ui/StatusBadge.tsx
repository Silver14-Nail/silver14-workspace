import { MockOrder } from '@/context/CartContext';

const statusConfig: Record<MockOrder['status'], { bg: string; text: string }> = {
  Delivered: { bg: 'bg-[#F0FFF4]', text: 'text-[#4A7A5A]' },
  Shipped: { bg: 'bg-[#F0F0FF]', text: 'text-[#4A4A9A]' },
  Processing: { bg: 'bg-[#F5F5F5]', text: 'text-[#6A6A6A]' },
  Crafting: { bg: 'bg-[#F5F5F5]', text: 'text-[#6A6A6A]' },
};

export default function StatusBadge({ status }: { status: MockOrder['status'] }) {
  const config = statusConfig[status] || statusConfig.Processing;
  return (
    <span className={`text-xs px-3 py-1.5 uppercase tracking-widest ${config.bg} ${config.text}`}>
      {status}
    </span>
  );
}
