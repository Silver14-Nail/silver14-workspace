import { dir } from 'i18next';
import { Cormorant } from 'next/font/google';
// import Script from 'next/script';
import {
  initServerI18next,
  getT,
  getResources,
  generateI18nStaticParams,
} from 'next-i18next/server';
import { I18nProvider } from 'next-i18next/client';
import { StoreProvider } from '../../store/StoreProvider';
import { Footer } from '../../components/layout/Footer';
import { Navbar } from '../../components/layout/Navbar';
import { AIChat } from '../../components/shared/AIChat';
import i18nConfig from '../../i18n.config';
import { createStorefrontJsonLd, createStorefrontMetadata } from '../../lib/seo';
import '../../styles/index.css';

const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

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
    <html lang={lng} dir={dir(lng)} className={cormorant.variable}>
      <head />
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(createStorefrontJsonLd(lng)),
          }}
          type="application/ld+json"
        />
        {/* <Script id="crisp-chat" strategy="afterInteractive">
          {`
            window.$crisp = [];
            window.CRISP_WEBSITE_ID = "accfed8c-e6fd-452b-a8c8-6eb8b3e1078a";

            (function () {
              const d = document;
              const s = d.createElement("script");

              s.src = "https://client.crisp.chat/l.js";
              s.async = 1;

              d.getElementsByTagName("head")[0].appendChild(s);
            })();
        `}
        </Script> */}
        <StoreProvider>
          <I18nProvider language={lng} resources={resources}>
            <Navbar />
            {children}
            <Footer />
            <AIChat />
          </I18nProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
