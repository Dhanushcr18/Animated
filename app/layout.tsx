import type { Metadata } from 'next';
import './globals.css';
import SmoothScroll from '@/components/providers/SmoothScroll';
import Cursor from '@/components/Cursor';

export const metadata: Metadata = {
  title: 'Jesko Jets — The Future of Private Aviation',
  description: 'Experience the pinnacle of electric aviation. Silent, zero-emissions, uncompromising luxury. Reserve your private jet today.',
  openGraph: {
    title: 'Jesko Jets — The Future of Private Aviation',
    description: 'Silent, zero-emissions, uncompromising luxury.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Cursor />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
