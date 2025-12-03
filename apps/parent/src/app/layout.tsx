import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/providers/AuthProvider';
import { ConvexClientProvider } from '@/providers/ConvexClientProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Altaviapp - Padres',
  description: 'Portal para padres de familia - Seguimiento de transporte escolar',
  manifest: '/manifest.json',
  themeColor: '#042940',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
