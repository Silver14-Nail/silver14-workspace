import { Clock, Package, Truck, Check } from 'lucide-react';

export const TRACKING_STEPS = [
  { key: 'Processing', icon: Clock },
  { key: 'Crafting', icon: Package },
  { key: 'Shipped', icon: Truck },
  { key: 'Delivered', icon: Check },
] as const;
