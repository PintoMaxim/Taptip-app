import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    statusBarStyle: "default",
    title: "TapTip",
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-icon.png',
  }
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
    <html lang="fr" className="bg-white">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        {children}
      </body>
    </html>
  );
}
