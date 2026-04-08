import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
  const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.COZE_SUPABASE_ANON_KEY || '';

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__SUPABASE_URL__ = '${supabaseUrl}';
              window.__SUPABASE_ANON_KEY__ = '${supabaseAnonKey}';
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background flex flex-col">
        {isDev && <Inspector />}
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
