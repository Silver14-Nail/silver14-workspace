import { cookies } from 'next/headers';
import ReduxProvider from '@/components/ReduxProvider';
import { AdminI18nProvider } from '@/i18n/AdminI18nProvider';
import { defaultLocale, LOCALE_COOKIE } from '@/i18n/config';

import '../styles/index.css';

export const metadata = {
  title: 'Silver14 Nail Admin',
  description: 'CMS and operations dashboard for Silver14 Nail.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialLocale = cookieStore.get(LOCALE_COOKIE)?.value ?? defaultLocale;

  return (
    <html lang={initialLocale}>
      <body>
        <AdminI18nProvider initialLocale={initialLocale}>
          <ReduxProvider>{children}</ReduxProvider>
        </AdminI18nProvider>
      </body>
    </html>
  );
}
