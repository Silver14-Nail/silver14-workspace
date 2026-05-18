import { headers } from 'next/headers';

import AdminShell from '@/components/layouts/AdminShell';
import { getSession } from '@/lib/auth/session';

import '../styles/index.css';

export const metadata = {
  title: 'Silver14 Nail Admin',
  description: 'CMS and operations dashboard for Silver14 Nail.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAuthPage = pathname === '/login' || pathname.startsWith('/login');

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-[#F8F8FA] flex items-center justify-center">
          {children}
        </body>
      </html>
    );
  }

  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <AdminShell user={session?.user ?? null}>{children}</AdminShell>
      </body>
    </html>
  );
}
