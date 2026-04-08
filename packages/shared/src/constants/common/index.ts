import { Github, Mail } from 'lucide-react';

// Header Navigation Items
export const NAV_ITEMS = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Compare', href: '#compare' },
    { name: 'Download', href: '#download' },
] as const;

export const CORE_NAV_ITEMS = [
    { name: 'System Status', href: '#status' },
    { name: 'Documentation', href: '#docs' },
    { name: 'Support', href: '#support' },
] as const;

// Footer
export const FOOTER_LINKS = {
    product: [
        { name: 'Features', href: '#features' },
        { name: 'How it Works', href: '#how-it-works' },
        { name: 'Download', href: '#download' },
    ],
    resources: [
        { name: 'Documentation', href: '#' },
        { name: 'Guides', href: '#guides' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms of Service', href: '/terms-of-service' },
    ],
};

export const CORE_FOOTER_LINKS = {
    resources: [
        { name: 'Admin Guides', href: '#docs' },
        { name: 'Technical Support', href: '#support' },
        { name: 'API Reference', href: '#api' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms of Service', href: '/terms-of-service' },
    ],
};

export const SOCIAL_LINKS = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/markromolecule' },
    { name: 'Email', icon: Mail, href: 'mailto:suppport@sentinelph.tech' },
];

// Splashscreen
export interface SplashscreenProviderProps {
    children: React.ReactNode;
}
