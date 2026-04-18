import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Botsmart Africa - Southern Africa\'s Premier E-Commerce Platform',
    template: '%s | Botsmart Africa',
  },
  description: 'Discover quality products from trusted sellers across Southern Africa. Shop from multiple vendors with secure payments, fast delivery, and excellent customer service in South Africa, Namibia, Botswana, Zimbabwe and more.',
  keywords: ['ecommerce', 'online shopping', 'southern africa', 'south africa', 'botswana', 'namibia', 'zimbabwe', 'multi-vendor', ' sellers', 'shopping', 'deals', 'shop'],
  authors: [{ name: 'Botsmart Africa' }],
  generator: 'Botsmart Africa',
  openGraph: {
    title: 'Botsmart Africa - Southern Africa\'s Premier E-Commerce Platform',
    description: 'Discover quality products from trusted sellers across Southern Africa.',
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
