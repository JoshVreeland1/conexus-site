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
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#14213D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {children}
      </body>
    </html>
  );
}
