import './global.css';
import { AdminAuthProvider } from '@/features/admin/auth/admin-auth-provider';
import { AdminI18nProvider } from '@/features/admin/i18n/admin-i18n-provider';

export const metadata = {
  title: 'Silver14 Nail Admin',
  description: 'CMS and operations dashboard for Silver14 Nail.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AdminI18nProvider>
          <AdminAuthProvider>{children}</AdminAuthProvider>
        </AdminI18nProvider>
      </body>
    </html>
  );
}
