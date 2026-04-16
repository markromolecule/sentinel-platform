'use client';

import { MessageSquare, Plus, Search } from 'lucide-react';
import { Button, Input, SearchBar, cn } from '@sentinel/ui';
import { ReactNode } from 'react';

interface MessagingLayoutProps {
    sidebar: ReactNode;
    children: ReactNode;
    className?: string;
}

export function MessagingLayout({ sidebar, children, className }: MessagingLayoutProps) {
    return (
        <div className={cn('flex h-[calc(100vh-10rem)] min-h-[500px] gap-6', className)}>
            {/* Sidebar / Chat List */}
            <div className="bg-muted/50 border-border/50 flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border md:w-80 lg:w-96">
                {sidebar}
            </div>

            {/* Main Chat Area */}
            <div className="bg-muted/50 border-border/50 hidden flex-1 items-center justify-center overflow-hidden rounded-2xl border md:flex">
                {children}
            </div>
        </div>
    );
}

interface ChatListHeaderProps {
    title: string;
    onNewChat?: () => void;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
}

export function ChatListHeader({
    title,
    onNewChat,
    searchPlaceholder = 'Search conversations...',
    searchValue,
    onSearchChange,
}: ChatListHeaderProps) {
    return (
        <div className="border-border/50 bg-background/50 space-y-4 border-b p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-foreground text-xl font-bold">{title}</h2>
                {onNewChat && (
                    <Button
                        size="sm"
                        onClick={onNewChat}
                        className="h-8 bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New
                    </Button>
                )}
            </div>
            <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground h-9 pl-9 focus:border-[#323d8f]"
                />
            </div>
        </div>
    );
}

interface MessagingEmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function MessagingEmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}: MessagingEmptyStateProps) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-8 text-center">
            <div className="bg-primary/10 mb-2 flex h-16 w-16 items-center justify-center rounded-full">
                {icon || <MessageSquare className="text-primary h-8 w-8" />}
            </div>
            <div>
                <h3 className="text-foreground text-lg font-bold">{title}</h3>
                <p className="text-muted-foreground mx-auto mt-2 max-w-[240px] text-sm">
                    {description}
                </p>
            </div>
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
