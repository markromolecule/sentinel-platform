'use client';

import { useLogoutMutation, useProfileQuery } from '@sentinel/hooks';
import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Menu, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@sentinel/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { ThemeToggle } from '@sentinel/ui';
import { HEADER_NAV_ITEMS } from '@sentinel/shared/constants';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { MOCK_NOTIFICATIONS } from '@sentinel/shared/constants';
import { format } from 'date-fns';
import { UserSearchBar } from '@/components/common/user-search-bar';

export default function StudentHeader() {
    const pathname = usePathname();
    const { profile, isLoading } = useProfileQuery();

    const { mutate: logout } = useLogoutMutation({
        onSuccess: () => {
            window.location.href = '/auth/login';
        },
    });

    const handleLogout = () => {
        logout(undefined);
    };

    // Student-facing activity notifications were explicitly deferred from the Phase 4 V1 rollout.
    const recentNotifications = MOCK_NOTIFICATIONS.slice(0, 4);

    const initials = profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}` : '';
    const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}` : '';
    const email = profile?.email || '';

    return (
        <header className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
            <div className="text-foreground relative container mx-auto flex h-16 max-w-7xl items-center justify-between px-0">
                {/* Logo */}
                <div className="relative z-10 flex shrink-0 items-center gap-2">
                    <Link href="/student/classroom" className="flex items-center gap-2">
                        <div className="relative h-12 w-40">
                            {/* Light Mode Logo (Dark Text) */}
                            <NextImage
                                src="/icons/light-sentinel-logo.svg"
                                alt="Sentinel"
                                fill
                                className="object-contain dark:hidden"
                            />
                            {/* Dark Mode Logo (Light Text) */}
                            <NextImage
                                src="/icons/dark-sentinel-logo.svg"
                                alt="Sentinel"
                                fill
                                className="hidden object-contain dark:block"
                            />
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="absolute left-1/2 z-0 hidden -translate-x-1/2 items-center gap-8 md:flex">
                    <nav className="flex items-center gap-6">
                        {HEADER_NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'hover:text-foreground text-sm font-medium transition-colors',
                                    pathname === item.href ||
                                        (pathname.startsWith(item.href) &&
                                            item.href !== '/student/exam')
                                        ? 'text-foreground'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <UserSearchBar redirectPath="/student/message" />
                </div>

                {/* Actions & Profile */}
                <div className="relative z-10 flex shrink-0 items-center gap-2 md:gap-4">
                    <div className="hidden sm:flex">
                        <ThemeToggle />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground relative hidden sm:flex"
                            >
                                <Bell className="h-5 w-5" />
                                {recentNotifications.some((n) => !n.isRead) && (
                                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {recentNotifications.length === 0 ? (
                                <div className="text-muted-foreground p-4 text-center text-sm">
                                    No new notifications
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {recentNotifications.map((notification) => (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            className="flex cursor-pointer flex-col items-start gap-1 p-3"
                                        >
                                            <div className="flex w-full items-start justify-between">
                                                <span
                                                    className={cn(
                                                        'text-sm font-medium',
                                                        !notification.isRead &&
                                                            'text-blue-600 dark:text-blue-400',
                                                    )}
                                                >
                                                    {notification.title}
                                                </span>
                                                <span className="text-muted-foreground ml-2 text-xs whitespace-nowrap">
                                                    {format(notification.date, 'MMM d')}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground line-clamp-2 text-xs">
                                                {notification.message}
                                            </p>
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                asChild
                                className="text-primary cursor-pointer justify-center text-center font-medium"
                            >
                                <Link href="/student/notifications" className="w-full">
                                    View all notifications
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="ml-2 hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#323d8f] to-[#4a5bb8] text-xs font-bold text-white transition-all md:flex relative overflow-hidden">
                                {isLoading ? (
                                    '...'
                                ) : profile?.avatarUrl ? (
                                    <NextImage
                                        src={profile.avatarUrl}
                                        alt={`${profile.firstName || ''} avatar`}
                                        fill
                                        sizes="32px"
                                        className="object-cover"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm leading-none font-medium">
                                        {isLoading ? 'Loading...' : fullName}
                                    </p>
                                    <p className="text-muted-foreground text-xs leading-none">
                                        {isLoading ? '' : email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href="/student/profile" className="flex w-full items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href="/student/setting" className="flex w-full items-center">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile Hamburger Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-foreground hover:bg-accent h-10 w-10 md:hidden"
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="bg-background border-border text-foreground w-[300px] px-6"
                        >
                            <SheetHeader>
                                <SheetTitle className="text-foreground">Menu</SheetTitle>
                            </SheetHeader>
                            <div className="border-border mt-4 mb-2 flex items-center justify-between border-b py-2">
                                <span className="text-foreground text-sm font-medium">Theme</span>
                                <ThemeToggle />
                            </div>
                            <div className="mt-2 flex flex-col gap-1">
                                {HEADER_NAV_ITEMS.map((item) => (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                'hover:bg-accent hover:text-accent-foreground w-full justify-start',
                                                pathname === item.href ||
                                                    (pathname.startsWith(item.href) &&
                                                        item.href !== '/student/exam')
                                                    ? 'bg-accent text-accent-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                ))}
                                {/* Notification Link for Mobile */}
                                <Link href="/student/notifications">
                                    <Button
                                        variant="ghost"
                                        className="hover:bg-accent hover:text-accent-foreground text-muted-foreground w-full justify-start"
                                    >
                                        <Bell className="mr-2 h-4 w-4" />
                                        Notifications
                                    </Button>
                                </Link>
                                <div className="bg-border my-2 h-px" />
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
