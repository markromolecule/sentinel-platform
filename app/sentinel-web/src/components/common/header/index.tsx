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
    const isProduction = typeof window !== 'undefined' &&
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
        <header className="absolute lg:fixed top-0 left-0 right-0 z-50 pt-1 md:pt-4 lg:pt-8 animate-fade-in transition-all duration-300">
            <div className="container mx-auto px-6 lg:px-8 relative">
                <div className="flex items-center justify-between w-full lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-x-10">
                    {/* Logo (Left side) */}
                    <div className="flex flex-1 justify-start lg:flex-none lg:justify-self-start">
                        <Link href={getHomeUrl()} className="flex items-center gap-3 group">
                            <div className="relative w-auto h-[70px] md:h-[80px] lg:h-[115px] aspect-160/60 transition-all duration-300">
                                <Image
                                    src="/icons/sentinel-logo.svg"
                                    alt="Sentinel Logo"
                                    fill
                                    className="object-contain lg:object-left"
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Centered Navigation (Glass Container) */}
                    <div className="hidden lg:flex justify-center lg:justify-self-center">
                        <nav className="flex items-center gap-1 bg-white/3 backdrop-blur-md border border-white/8 px-4 py-3 rounded-full shadow-lg">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-base font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right Side Actions (Login/Register) */}
                    <div className="hidden lg:flex lg:justify-self-end">
                        <div className="flex items-center gap-3 shrink-0 bg-white/3 backdrop-blur-md border border-white/8 px-4 py-3 rounded-full shadow-lg">
                            <Button
                                asChild
                                variant="ghost"
                                className="text-gray-300 hover:text-white hover:bg-white/5 rounded-full"
                            >
                                <Link href={getAuthUrl('/auth/login')}>Log in</Link>
                            </Button>
                            <Button
                                asChild
                                className="bg-var(--sentinel-primary) hover:bg-(--sentinel-primary)/90 text-white font-medium px-5 rounded-full shadow-lg shadow-(--sentinel-primary)/20"
                            >
                                <Link href={getAuthUrl('/auth/register')}>Register</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <button
                                className="lg:hidden text-white p-2"
                                aria-label="Toggle menu"
                            >
                                <Menu size={24} />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] border-white/10 bg-[#0f0f10]/95 backdrop-blur-xl text-white">
                            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                            <nav className="flex flex-col gap-2 mt-8">
                                {NAV_ITEMS.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-white/5"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="h-px bg-white/10 my-6" />
                                <div className="flex flex-col gap-4">
                                    <Link
                                        href={getAuthUrl('/auth/login')}
                                        className="text-gray-300 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 text-center font-medium"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Log in
                                    </Link>
                                    <Button
                                        asChild
                                        className="bg-(--sentinel-primary) hover:bg-(--sentinel-primary)/90 text-white font-medium w-full rounded-xl h-12"
                                    >
                                        <Link href={getAuthUrl('/auth/register')} onClick={() => setMobileMenuOpen(false)}>
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
