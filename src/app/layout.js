import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '../components/BottomNav';
import { AppProvider } from '../context/AppContext';
import { QuickAddProvider } from '../context/QuickAddContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Dana Kita',
  description: 'Persiapkan target tabunganmu untuk masa depan yang lebih baik',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-[family-name:var(--font-inter)] bg-[var(--color-secondary-background)] text-[var(--color-text-primary)] min-h-screen flex justify-center pb-20 sm:pb-0`}>
        <AppProvider>
          <QuickAddProvider>
            <div className="w-full max-w-md bg-white min-h-screen shadow-sm relative overflow-x-hidden flex flex-col h-full pb-16">
              {children}
              <BottomNav />
            </div>
          </QuickAddProvider>
        </AppProvider>
      </body>
    </html>
  );
}
