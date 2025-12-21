import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";

import { ClientLayout } from "@/components/ClientLayout";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "The Commons Game",
  description: "A collaborative game for building community resilience",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Commons Game",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeBootstrapScript = `(() => {
    try {
      const accent = localStorage.getItem('commons-theme-accent') || 'default';
      const highContrast = localStorage.getItem('commons-theme-high-contrast') === 'true';
      const doc = document.documentElement;
      const majorClasses = ['dark','lofi','dim'];
      const accentClasses = ['ocean','forest','sunset','monochrome'];
      doc.classList.remove(...majorClasses, ...accentClasses, 'high-contrast');
      if (highContrast) {
        doc.classList.add('high-contrast');
      } else if (accent && accent !== 'default') {
        doc.classList.add(accent);
      }
    } catch (e) {}
  })();`;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth overflow-x-hidden"
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="The Commons Game" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased px-3 snap-y snap-mandatory overflow-x-hidden`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
