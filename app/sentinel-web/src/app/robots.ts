import { MetadataRoute } from 'next';

/**
 * Generate robots.txt for Google Search Console
 * This file is automatically picked up by Next.js and served at /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.sentinelph.tech';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/superadmin/',
                    '/auth/',
                    '/dashboard/',
                    '/exams/',
                    '/exam/',
                    '/history/',
                    '/message/',
                    '/notifications/',
                    '/profile/',
                    '/setting/',
                    '/api/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
