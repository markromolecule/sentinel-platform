'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@sentinel/ui';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@sentinel/ui';
import { CORE_NAV_ITEMS } from '@sentinel/shared/constants';

interface NavItem {
    name: string;
    href: string;
}

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Configure URLs for production subdomain routing
    const isProduction = typeof window !== 'undefined' &&
        !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1');

    const getAuthUrl = (path: string) => {
        if (isProduction) {
            return `https://core.sentinelph.tech${path}`;
        }
        return path;
    };

    return (
        <header className="absolute top-0 left-0 right-0 z-50 pt-4 md:pt-6 lg:pt-10 animate-fade-in">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between w-full">
                    {/* Logo (Left side) */}
                    <div className="flex flex-1 justify-start lg:flex-none">
                        <Link href="/" className="flex items-center group -ml-5">
                            <div className="relative w-auto h-20 md:h-26 lg:h-32 aspect-120/60 transition-all duration-300">
                                <Image
                                    src="/icons/sentinel-logo.svg"
                                    alt="Sentinel Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden lg:flex lg:justify-self-end">
                        <div className="flex items-center gap-3 shrink-0 bg-white/3 backdrop-blur-md border border-white/8 px-4 py-3 rounded-full shadow-lg">
                            <Button
                                asChild
                                variant="ghost"
                                className="text-gray-300 hover:text-white hover:bg-white/5 rounded-full"
                            >
                                <Link href={getAuthUrl('/auth/login')}>Administrator</Link>
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
                            <SheetTitle className="sr-only">Administration Menu</SheetTitle>
                            <nav className="flex flex-col gap-2 mt-8">
                                {CORE_NAV_ITEMS.map((item: NavItem) => (
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
                                    <Button
                                        asChild
                                        className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white font-medium w-full rounded-xl h-12"
                                    >
                                        <Link href={getAuthUrl('/auth/login')} onClick={() => setMobileMenuOpen(false)}>
                                            Administrator Login
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
