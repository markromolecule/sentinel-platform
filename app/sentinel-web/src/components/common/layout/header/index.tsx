'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@sentinel/ui';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@sentinel/ui';
import { NAV_ITEMS } from '@sentinel/shared/constants';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Configure URLs for production subdomain routing
    // In production: use app.sentinelph.tech
    // In development: use relative paths (stays on localhost:3000)
    const isProduction =
        typeof window !== 'undefined' &&
        !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1');

    const getAuthUrl = (path: string) => {
        if (isProduction) {
            return `https://app.sentinelph.tech${path}`;
        }
        // In development, use relative path
        return path;
    };
    const getHomeUrl = () => {
        if (typeof window !== 'undefined' && window.location.hostname === 'app.sentinelph.tech') {
            return 'https://sentinelph.tech';
        }
        return '/';
    };

    return (
        <header className="animate-fade-in absolute top-0 right-0 left-0 z-50 pt-1 transition-all duration-300 md:pt-4 lg:fixed lg:pt-8">
            <div className="relative container mx-auto px-6 lg:px-8">
                <div className="flex w-full items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-x-10">
                    {/* Logo (Left side) */}
                    <div className="-ml-5 flex flex-1 justify-start lg:flex-none lg:justify-self-start">
                        <Link href={getHomeUrl()} className="group flex items-center gap-3">
                            <div className="relative aspect-160/60 h-[70px] w-auto transition-all duration-300 md:h-[80px] lg:h-[115px]">
                                <Image
                                    src="/icons/sentinel-logo.svg"
                                    alt="Sentinel Logo"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Centered Navigation (Glass Container) */}
                    <div className="hidden justify-center lg:flex lg:justify-self-center">
                        <nav className="flex items-center gap-1 rounded-full border border-white/8 bg-white/3 px-4 py-3 shadow-lg backdrop-blur-md">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="rounded-full px-4 py-2 text-base font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right Side Actions (Login/Register) */}
                    <div className="hidden lg:flex lg:justify-self-end">
                        <div className="flex shrink-0 items-center gap-3 rounded-full border border-white/8 bg-white/3 px-4 py-3 shadow-lg backdrop-blur-md">
                            <Button
                                asChild
                                variant="ghost"
                                className="rounded-full text-gray-300 hover:bg-white/5 hover:text-white"
                            >
                                <Link href={getAuthUrl('/auth/login')}>Log in</Link>
                            </Button>
                            <Button
                                asChild
                                className="bg-var(--sentinel-primary) rounded-full px-5 font-medium text-white shadow-(--sentinel-primary)/20 shadow-lg hover:bg-(--sentinel-primary)/90"
                            >
                                <Link href={getAuthUrl('/auth/register')}>Register</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <button className="p-2 text-white lg:hidden" aria-label="Toggle menu">
                                <Menu size={24} />
                            </button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[300px] border-white/10 bg-[#0f0f10]/95 text-white backdrop-blur-xl"
                        >
                            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                            <nav className="mt-8 flex flex-col gap-2">
                                {NAV_ITEMS.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="rounded-xl px-4 py-3 text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="my-6 h-px bg-white/10" />
                                <div className="flex flex-col gap-4 px-4">
                                    <Link
                                        href={getAuthUrl('/auth/login')}
                                        className="rounded-xl px-4 py-3 text-center font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Log in
                                    </Link>
                                    <Button
                                        asChild
                                        className="h-12 w-full rounded-xl bg-(--sentinel-primary) font-medium text-white hover:bg-(--sentinel-primary)/90"
                                    >
                                        <Link
                                            href={getAuthUrl('/auth/register')}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Register
                                        </Link>
                                    </Button>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
