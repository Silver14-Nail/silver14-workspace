import { dir } from 'i18next';
import {
  initServerI18next,
  getT,
  getResources,
  generateI18nStaticParams,
} from 'next-i18next/server';
import { I18nProvider } from 'next-i18next/client';
import { CartProvider } from '../../context/CartContext';
import { Footer } from '../../components/layout/Footer';
import { Navbar } from '../../components/layout/Navbar';
import { CustomerAuthProvider } from '../../features/auth/customer-auth-provider';
import i18nConfig from '../../i18n.config';
import { createStorefrontJsonLd, createStorefrontMetadata } from '../../lib/seo';
import '../../styles/index.css';

initServerI18next(i18nConfig);

export async function generateStaticParams() {
  return generateI18nStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }) {
  const { lng } = await params;

  return createStorefrontMetadata({ locale: lng });
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { i18n } = await getT();
  const resources = getResources(i18n);

  return (
    <html lang={lng} dir={dir(lng)}>
      <head />
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(createStorefrontJsonLd(lng)),
          }}
          type="application/ld+json"
        />
        <I18nProvider language={lng} resources={resources}>
          <CustomerAuthProvider>
            <CartProvider>
              <Navbar />
              {children}
              <Footer />
            </CartProvider>
          </CustomerAuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
