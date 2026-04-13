"use client";

import { MessageSquare, Plus, Search } from "lucide-react";
import { Button, Input, SearchBar, cn } from "@sentinel/ui";
import { ReactNode } from "react";

interface MessagingLayoutProps {
    sidebar: ReactNode;
    children: ReactNode;
    className?: string;
}

export function MessagingLayout({ sidebar, children, className }: MessagingLayoutProps) {
    return (
        <div className={cn("h-[calc(100vh-10rem)] min-h-[500px] flex gap-6", className)}>
            {/* Sidebar / Chat List */}
            <div className="w-full md:w-80 lg:w-96 flex flex-col bg-muted/50 rounded-2xl border border-border/50 overflow-hidden shrink-0">
                {sidebar}
            </div>

            {/* Main Chat Area */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-muted/50 rounded-2xl border border-border/50 overflow-hidden">
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
    searchPlaceholder = "Search conversations...",
    searchValue,
    onSearchChange,
}: ChatListHeaderProps) {
    return (
        <div className="p-4 border-b border-border/50 space-y-4 bg-background/50">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                {onNewChat && (
                    <Button size="sm" onClick={onNewChat} className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white h-8">
                        <Plus className="w-4 h-4 mr-2" />
                        New
                    </Button>
                )}
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-9 bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-[#323d8f] h-9"
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                {icon || <MessageSquare className="w-8 h-8 text-primary" />}
            </div>
            <div>
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground max-w-[240px] mx-auto mt-2">
                    {description}
                </p>
            </div>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
