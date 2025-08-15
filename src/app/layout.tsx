// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-geist-sans', subsets: ['latin'] });
const robotoMono = Roboto_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Conexus', template: '%s · Conexus' },
  description: 'Faster multifamily maintenance—without the chaos.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#14213D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {children}
      </body>
    </html>
  );
}
