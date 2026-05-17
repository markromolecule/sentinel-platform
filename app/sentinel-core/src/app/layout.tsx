import type { Metadata } from 'next';
import './globals.css';
import { SmoothScroll } from '@/components/common/smooth-scroll';
import { SplashscreenProvider } from '@/components/common';
import { Analytics } from '@vercel/analytics/next';
import Providers from './providers';

const dmSans = {
    variable: 'font-dm-sans',
};

const geistMono = {
    variable: 'font-geist-mono',
};

export const metadata: Metadata = {
    title: {
        default: 'Main Application | Administrator',
        template: 'Sentinel PH | %s',
    },
    robots: {
        index: false,
        follow: false,
    },
    icons: {
        icon: [
            { url: '/icons/icon0.svg', type: 'image/svg+xml' },
            { url: '/icons/icon1.png', type: 'image/png' },
            { url: '/icons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
            { url: '/icons/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
        ],
        shortcut: '/icons/favicon.ico',
        apple: '/icons/apple-icon.png',
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
                    <Providers>{children}</Providers>
                </SplashscreenProvider>
            </body>
        </html>
    );
}
