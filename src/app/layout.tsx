import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';

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
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background flex flex-col">
        <AuthProvider>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
