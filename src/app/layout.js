import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '../components/BottomNav';
import { AppProvider } from '../context/AppContext';
import { QuickAddProvider } from '../context/QuickAddContext';
import { ToastProvider } from '../components/Toast';
import AuthWrapper from '../components/AuthWrapper';
import Script from 'next/script';
import NotificationHandler from '../components/NotificationHandler';
import PWAPrompt from '../components/PWAPrompt';
import OnboardingWrapper from '../components/OnboardingWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Dana Kita',
  description: 'Persiapkan target tabunganmu untuk masa depan yang lebih baik',
  manifest: process.env.NODE_ENV === 'production' ? '/danakita/manifest.json' : '/manifest.json',
};

export default function RootLayout({ children }) {
  const isProd = process.env.NODE_ENV === 'production';
  const basePath = isProd ? '/danakita' : '';

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dana Kita" />
        <link rel="apple-touch-icon" href={`${basePath}/globe.svg`} />
      </head>
      <body className={`${inter.variable} font-[family-name:var(--font-inter)] bg-[var(--color-secondary-background)] text-[var(--color-text-primary)] min-h-screen flex justify-center pb-20 sm:pb-0`}>
        <AppProvider>
          <QuickAddProvider>
            <ToastProvider>
              <AuthWrapper>
                <NotificationHandler />
                <OnboardingWrapper />
                <div className="w-full max-w-md bg-white min-h-screen shadow-sm relative overflow-x-hidden flex flex-col h-full pb-16">
                  {children}
                  <PWAPrompt />
                  <BottomNav />
                </div>
              </AuthWrapper>
            </ToastProvider>
          </QuickAddProvider>
        </AppProvider>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                const swPath = '${basePath}/sw.js';
                navigator.serviceWorker.register(swPath);
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
