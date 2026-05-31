import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'PNP365 - تازہ ترین خبریں',
    template: '%s | PNP365',
  },
  description: 'پاکستان کی تازہ ترین خبریں، بریکنگ نیوز، کھیل، کاروبار، شوبز، سائنس و ٹیکنالوجی، صحت اور تعلیم',
  keywords: ['پاکستان', 'خبریں', 'نیوز', 'بریکنگ', 'اردو خبریں'],
  openGraph: {
    title: 'PNP365',
    description: 'پاکستان کی تازہ ترین خبریں',
    type: 'website',
    locale: 'ur_PK',
    siteName: 'PNP365',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PNP365',
    description: 'پاکستان کی تازہ ترین خبریں',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'facebook-domain-verification': process.env.FACEBOOK_VERIFICATION || '',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html dir="rtl" lang="ur">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
