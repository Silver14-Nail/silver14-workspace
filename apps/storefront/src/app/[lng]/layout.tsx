import { dir } from 'i18next';
import { Unna, Noto_Sans_JP } from 'next/font/google';
import { cookies } from 'next/headers';
import Script from 'next/script';
import {
  initServerI18next,
  getT,
  getResources,
  generateI18nStaticParams,
} from 'next-i18next/server';
import { I18nProvider } from 'next-i18next/client';
import { StoreProvider } from '../../store/StoreProvider';
import {
  CURRENCY_COOKIE,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from '../../config/commerce.config';
import { Footer } from '../../components/layout/Footer';
import { Navbar } from '../../components/layout/Navbar';
import i18nConfig from '../../i18n.config';
import { createStorefrontJsonLd, createStorefrontMetadata } from '../../lib/seo';
import { getCollections } from '../../features/collections/collections.api';
import '../../styles/index.css';

const unna = Unna({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-primary',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-jp',
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
  const { i18n } = await getT('translation', { lng });
  const resources = getResources(i18n);

  const cookieStore = await cookies();
  const rawCurrency = cookieStore.get(CURRENCY_COOKIE)?.value ?? '';
  const initialCurrencyCode: CurrencyCode = (SUPPORTED_CURRENCIES as readonly string[]).includes(
    rawCurrency,
  )
    ? (rawCurrency as CurrencyCode)
    : 'USD';

  let navCollections: Awaited<ReturnType<typeof getCollections>>['data'] = [];
  try {
    const result = await getCollections({ limit: 20, locale: lng });
    navCollections = result.data;
  } catch {
    // fallback to empty — Navbar handles gracefully
  }

  return (
    <html lang={lng} dir={dir(lng)} className={`${unna.variable} ${notoSansJP.variable}`}>
      <head />
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(createStorefrontJsonLd(lng)),
          }}
          type="application/ld+json"
        />
        <Script id="crisp-chat" strategy="afterInteractive">
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

            // On mobile (<768px) push Crisp above the fixed MobileCartBar (~84px).
            // Crisp renders inside its own iframe with position:fixed so CSS !important
            // from the parent document cannot override it — we must use JS on the host el.
            (function moveCrispAboveCartBar() {
              var isMobile = window.innerWidth < 768;
              if (!isMobile) return;

              var offset = 'calc(84px + env(safe-area-inset-bottom, 0px))';

              function applyOffset() {
                var el = document.getElementById('crisp-chatbox');
                if (el) {
                  el.style.setProperty('bottom', offset, 'important');
                  // Crisp may also have a fixed iframe inside — move it too
                  var inner = el.querySelector('iframe');
                  if (inner && inner.style.position === 'fixed') {
                    inner.style.setProperty('bottom', offset, 'important');
                  }
                }
              }

              // Try immediately, then watch for Crisp to mount
              applyOffset();
              var observer = new MutationObserver(function() { applyOffset(); });
              observer.observe(document.body, { childList: true, subtree: true });

              // Stop watching after Crisp has had time to fully load
              setTimeout(function() { observer.disconnect(); }, 10000);
            })();
        `}
        </Script>
        <StoreProvider initialCurrencyCode={initialCurrencyCode}>
          <I18nProvider language={lng} resources={resources}>
            <Navbar initialCollections={navCollections} />
            {children}
            <Footer />
          </I18nProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
