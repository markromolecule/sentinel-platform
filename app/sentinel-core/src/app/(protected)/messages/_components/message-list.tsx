'use client';

import { cn, Avatar, AvatarFallback, AvatarImage, SearchBar } from '@sentinel/ui';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '@sentinel/shared/types';

interface MessageListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function MessageList({ conversations, selectedId, onSelect }: MessageListProps) {
    return (
        <div
            className={cn(
                'border-border bg-card h-full w-full flex-col border-r md:w-[320px] lg:w-[380px]',
                selectedId ? 'hidden md:flex' : 'flex',
            )}
        >
            <div className="border-border border-b p-4">
                <h2 className="mb-4 text-xl font-bold">Messages</h2>
                <SearchBar
                    placeholder="Search messages..."
                    className="bg-muted/50 border-input focus-visible:ring-primary"
                />
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto">
                {conversations.map((conversation) => {
                    const participant = conversation.participants[0];
                    return (
                        <button
                            key={conversation.id}
                            onClick={() => onSelect(conversation.id)}
                            className={cn(
                                'hover:bg-muted/50 border-border/50 flex w-full items-start gap-4 border-b p-4 text-left transition-colors',
                                selectedId === conversation.id && 'bg-muted',
                            )}
                        >
                            <div className="relative">
                                <Avatar className="border-background h-10 w-10 border-2 md:h-12 md:w-12">
                                    <AvatarImage src={participant.avatar} alt={participant.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {participant.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span
                                    className={cn(
                                        'border-background absolute right-0 bottom-0 h-3 w-3 rounded-full border-2',
                                        participant.status === 'online' && 'bg-emerald-500',
                                        participant.status === 'busy' && 'bg-amber-500',
                                        participant.status === 'offline' && 'bg-slate-500',
                                    )}
                                />
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="truncate text-sm font-semibold md:text-base">
                                        {participant.name}
                                    </span>
                                    {conversation.lastMessage && (
                                        <span className="text-muted-foreground ml-2 text-xs whitespace-nowrap">
                                            {formatDistanceToNow(
                                                new Date(conversation.lastMessage.timestamp),
                                                {
                                                    addSuffix: false,
                                                },
                                            )}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <p
                                        className={cn(
                                            'truncate pr-2 text-xs md:text-sm',
                                            conversation.unreadCount && conversation.unreadCount > 0
                                                ? 'text-foreground font-medium'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {conversation.lastMessage?.content || 'No messages yet'}
                                    </p>
                                    {conversation.unreadCount && conversation.unreadCount > 0 ? (
                                        <span className="bg-primary text-primary-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                                            {conversation.unreadCount}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
