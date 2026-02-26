import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '../components/BottomNav';
import { AppProvider } from '../context/AppContext';
import { QuickAddProvider } from '../context/QuickAddContext';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Dana Kita',
  description: 'Persiapkan target tabunganmu untuk masa depan yang lebih baik',
  manifest: '/danakita/manifest.json',
  themeColor: '#2563eb',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dana Kita" />
        <link rel="apple-touch-icon" href="/danakita/globe.svg" />
      </head>
      <body className={`${inter.variable} font-[family-name:var(--font-inter)] bg-[var(--color-secondary-background)] text-[var(--color-text-primary)] min-h-screen flex justify-center pb-20 sm:pb-0`}>
        <AppProvider>
          <QuickAddProvider>
            <div className="w-full max-w-md bg-white min-h-screen shadow-sm relative overflow-x-hidden flex flex-col h-full pb-16">
              {children}
              <BottomNav />
            </div>
          </QuickAddProvider>
        </AppProvider>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/danakita/sw.js');
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
