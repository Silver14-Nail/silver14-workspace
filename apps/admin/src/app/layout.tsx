import ReduxProvider from '@/components/ReduxProvider';

import '../styles/index.css';

export const metadata = {
  title: 'Silver14 Nail Admin',
  description: 'CMS and operations dashboard for Silver14 Nail.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
