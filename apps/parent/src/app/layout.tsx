import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MapsProvider } from '@/components/providers/MapsProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ConvexClientProvider } from '@/providers/ConvexClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Altaviapp - Padres',
  description: 'Portal para padres de familia - Seguimiento de transporte escolar',
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
            <MapsProvider>
              {children}
            </MapsProvider>
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
