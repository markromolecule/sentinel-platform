"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCIAL_LINKS = exports.CORE_FOOTER_LINKS = exports.FOOTER_LINKS = exports.CORE_NAV_ITEMS = exports.NAV_ITEMS = void 0;
const lucide_react_1 = require("lucide-react");
// Header Navigation Items
exports.NAV_ITEMS = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Compare', href: '#compare' },
    { name: 'Download', href: '#download' },
];
exports.CORE_NAV_ITEMS = [
    { name: 'System Status', href: '#status' },
    { name: 'Documentation', href: '#docs' },
    { name: 'Support', href: '#support' },
];
// Footer
exports.FOOTER_LINKS = {
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
exports.CORE_FOOTER_LINKS = {
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
exports.SOCIAL_LINKS = [
    { name: 'GitHub', icon: lucide_react_1.Github, href: '#' },
    { name: 'Email', icon: lucide_react_1.Mail, href: 'mailto:hello@sentinelph.tech' },
];
//# sourceMappingURL=index.js.map