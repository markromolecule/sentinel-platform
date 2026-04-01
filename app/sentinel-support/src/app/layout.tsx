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
    title: {
        default: "Support Portal | Sentinel",
        template: "Sentinel PH | %s"
    },
    robots: {
        index: false,
        follow: false,
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
            <body
                className={`${dmSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning
            >
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
