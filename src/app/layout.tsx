import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: {
    default: 'ShopHub - Your Premium eCommerce Store',
    template: '%s | ShopHub',
  },
  description: 'Shop the best products at unbeatable prices. Fast shipping, secure checkout, and 24/7 support.',
  keywords: ['ecommerce', 'online shopping', 'products', 'deals', 'shop'],
  authors: [{ name: 'ShopHub' }],
  generator: 'ShopHub',
  openGraph: {
    title: 'ShopHub - Your Premium eCommerce Store',
    description: 'Shop the best products at unbeatable prices.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background">
        {isDev && <Inspector />}
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
