import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import AutoFetchTrigger from '@/components/public/AutoFetchTrigger';
import { Providers } from './providers';
export const metadata: Metadata = {
  title: {
    default: 'Azad Khabar - تازہ ترین خبریں',
    template: '%s | Azad Khabar',
  },
  description: 'پاکستان کی تازہ ترین خبریں، بریکنگ نیوز، کھیل، کاروبار، شوبز، سائنس و ٹیکنالوجی، صحت اور تعلیم',
  keywords: ['پاکستان', 'خبریں', 'نیوز', 'بریکنگ', 'اردو خبریں', 'Azad Khabar', 'آزاد خبر'],
  openGraph: {
    title: 'Azad Khabar - تازہ ترین خبریں',
    description: 'پاکستان کی تازہ ترین خبریں، بریکنگ نیوز، کھیل، کاروبار، شوبز، سائنس و ٹیکنالوجی، صحت اور تعلیم',
    type: 'website',
    locale: 'ur_PK',
    siteName: 'Azad Khabar',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://azadkhabar.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Azad Khabar',
    description: 'پاکستان کی تازہ ترین خبریں، بریکنگ نیوز، کھیل، کاروبار، شوبز، سائنس و ٹیکنالوجی، صحت اور تعلیم',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      'ur': '/',
      'ur-PK': '/',
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION || '',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://azadkhabar.vercel.app';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Azad Khabar',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="ur" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-slate-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <AutoFetchTrigger />
        </Providers>
      </body>
    </html>
  );
}
