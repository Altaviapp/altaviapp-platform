import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/session";

export const metadata: Metadata = {
  title: "Abordo",
  description: "Rutas escolares en vivo para colegios, conductores y familias.",
  appleWebApp: { capable: true, title: "Abordo", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#12301f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
