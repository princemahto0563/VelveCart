import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import MobileBottomNav from '@/components/common/MobileBottomNav';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://velvetcart.store'),
  title: { default: 'VelvetCart — Luxury Reimagined', template: '%s | VelvetCart' },
  description: 'Discover premium jewellery, fashion, beauty and home decor. Curated luxury for the modern connoisseur.',
  keywords: ['luxury shopping', 'jewellery', 'fashion', 'beauty', 'premium', 'velvetcart', 'india'],
  authors: [{ name: 'VelvetCart' }],
  creator: 'VelvetCart',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://velvetcart.store',
    siteName: 'VelvetCart',
    title: 'VelvetCart — Luxury Reimagined',
    description: 'Curated luxury jewellery, fashion and lifestyle for the discerning buyer.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VelvetCart' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VelvetCart — Luxury Reimagined',
    description: 'Curated luxury shopping experience.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '' },
  other: { 'pinterest-rich-pin': 'true' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <Navbar />
        <CartDrawer />
        <main className="pb-14 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0a0a0a',
              color: '#f5f0e8',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              borderRadius: '3px',
              padding: '12px 20px',
              marginBottom: '56px',
            },
            success: { iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' } },
          }}
        />
      </body>
    </html>
  );
}
