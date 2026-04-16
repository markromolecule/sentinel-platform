'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FOOTER_LINKS, SOCIAL_LINKS } from '@sentinel/shared/constants';

export function Footer() {
    return (
        <footer className="relative overflow-hidden border-t border-white/5 bg-[#0a0a0b]">
            {/* Top Gradient Line */}
            <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-(--sentinel-primary)/50 to-transparent"></div>

            <div className="container mx-auto px-6 py-16 md:py-20">
                {/* Main Footer Grid */}
                <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5 md:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link href="/" className="mb-6 flex items-center">
                            <Image
                                src="/icons/sentinel-logo.svg"
                                alt="Sentinel Logo"
                                width={140}
                                height={50}
                                className="-ml-5 h-12 w-auto"
                            />
                        </Link>
                        <p className="mb-6 max-w-xs text-sm leading-relaxed text-gray-400">
                            A mobile and web-based examination security system with gaze and audio
                            monitoring. Built for educators.
                        </p>
                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {SOCIAL_LINKS.map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                                    aria-label={social.name}
                                >
                                    <social.icon className="h-4 w-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                            Product
                        </h4>
                        <ul className="space-y-3">
                            {FOOTER_LINKS.product.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 transition-colors hover:text-white"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                            Resources
                        </h4>
                        <ul className="space-y-3">
                            {FOOTER_LINKS.resources.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 transition-colors hover:text-white"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                            Legal
                        </h4>
                        <ul className="space-y-3">
                            {FOOTER_LINKS.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 transition-colors hover:text-white"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} Sentinel. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-500">Stay secure with Sentinel.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
