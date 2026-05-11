import type { ReactNode } from 'react';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export type NavItem = {
  labelKey: string;
  href: string;
  descriptionKey: string;
};

export type Metric = {
  label: string;
  value: string;
  detail: string;
  trend: string;
};

export type TableRow = Array<ReactNode>;
