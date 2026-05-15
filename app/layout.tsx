import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TapTip - Soutenez votre serveur",
  description: "Consultez mon profil, mes avis et laissez-moi un pourboire en quelques secondes. Simple, rapide et sécurisé.",
  metadataBase: new URL('https://app.taptip.fr'),
  openGraph: {
    title: "TapTip - Soutenez votre serveur",
    description: "Consultez mon profil, mes avis et laissez-moi un pourboire en quelques secondes. Simple, rapide et sécurisé.",
    url: 'https://app.taptip.fr',
    siteName: 'TapTip',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TapTip Logo',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TapTip - Soutenez votre serveur',
    description: 'Laissez un pourboire et un avis en quelques secondes.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TapTip",
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-icon.png',
  }
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="bg-[#050505]">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#050505]`}
      >
        {children}
      </body>
    </html>
  );
}
