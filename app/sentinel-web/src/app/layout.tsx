import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/common/smooth-scroll";
import { SplashscreenProvider } from "@/components/common";
import { Analytics } from "@vercel/analytics/next";
import Providers from "./providers";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Sentinel PH",
  title: {
    default: "Sentinel PH | Smart Proctoring for Academic Integrity",
    template: "%s | Sentinel PH"
  },
  description: "Sentinel is a mobile and web platform for securing online exams, monitoring student focus, and preventing academic dishonesty. It's built for educators, ensuring fair testing everywhere.",
  openGraph: {
    siteName: "Sentinel PH",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: [
      { url: "/icons/icon0.svg", type: "image/svg+xml" },
      { url: "/icons/icon1.png", type: "image/png" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/favicon.ico",
    apple: "/icons/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="apple-mobile-web-app-title" content="Sentinel PH" />
      <body
        className={`${dmSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "name": "Sentinel PH",
                  "url": process.env.NEXT_PUBLIC_APP_URL || "https://www.sentinelph.tech",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://www.sentinelph.tech/search?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "name": "Sentinel PH",
                  "url": process.env.NEXT_PUBLIC_APP_URL || "https://www.sentinelph.tech",
                  "logo": "https://www.sentinelph.tech/icons/sentinel-logo.svg",
                  "sameAs": [
                    "https://www.facebook.com/sentinelph",
                    "https://twitter.com/sentinelph",
                    "https://www.linkedin.com/company/sentinelph"
                  ]
                }
              ]
            }),
          }}
        />
        <Analytics />
        <SmoothScroll />
        <SplashscreenProvider>
          <Providers>
            {children}
          </Providers>
        </SplashscreenProvider>
      </body>
    </html>
  );
}
