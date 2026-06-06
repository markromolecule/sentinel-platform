'use client';

import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Send, MoreVertical, ChevronLeft, MessageSquare } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@sentinel/ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { Conversation, Message } from '@sentinel/shared/types';
import { ParticipantProfileDialog } from './participant-profile-dialog';

interface ChatWindowProps {
    conversation: Conversation | null;
    messages: Message[];
    currentUserId: string;
    onSendMessage: (content: string) => void;
    onBack: () => void;
    isLoading?: boolean;
}

function ChatSkeleton() {
    return (
        <div className="bg-muted/5 custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-6 animate-pulse">
            {[...Array(4)].map((_, i) => {
                const isMe = i % 2 === 1;
                return (
                    <div
                        key={i}
                        className={cn(
                            'flex max-w-[85%] gap-3 md:max-w-[70%]',
                            isMe ? 'ml-auto flex-row-reverse' : '',
                        )}
                    >
                        {!isMe && (
                            <div className="bg-muted h-8 w-8 shrink-0 rounded-full" />
                        )}
                        <div
                            className={cn(
                                'rounded-2xl p-3 shadow-sm md:p-4 h-16 w-48 md:w-64 bg-muted/60',
                                isMe ? 'rounded-tr-sm bg-primary/20' : 'rounded-tl-sm border border-border/50',
                            )}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export function ChatWindow({
    conversation,
    messages,
    currentUserId,
    onSendMessage,
    onBack,
    isLoading = false,
}: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim()) return;
        onSendMessage(newMessage);
        setNewMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!conversation) {
        return (
            <div className="bg-muted/10 hidden h-full flex-1 flex-col items-center justify-center p-8 text-center md:flex">
                <div className="bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <MessageSquare className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Select a conversation</h3>
                <p className="text-muted-foreground max-w-sm">
                    Choose a contact from the list to start messaging or view previous chats.
                </p>
            </div>
        );
    }

    const participant = conversation.participants[0];

    return (
        <div className="bg-background relative flex h-full w-full flex-1 flex-col overflow-hidden">
            {/* Header */}
            <div className="border-border bg-card flex h-16 shrink-0 items-center justify-between border-b px-4 md:h-20 md:px-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="-ml-2 md:hidden"
                        onClick={onBack}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="relative shrink-0">
                        <Avatar className="border-border h-8 w-8 border md:h-10 md:w-10">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {participant.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span
                            className={cn(
                                'border-background absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2',
                                participant.status === 'online' && 'bg-emerald-500',
                                participant.status === 'busy' && 'bg-amber-500',
                                participant.status === 'offline' && 'bg-slate-500',
                            )}
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold md:text-base">{participant.name}</h3>
                        {participant.institution?.name && (
                            <div className="text-muted-foreground/80 mt-0.5 text-xs font-medium truncate max-w-[250px]">
                                {participant.institution.name}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="text-muted-foreground h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                                View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>Search in Conversation</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                                Block User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Messages Area */}
            {isLoading ? (
                <ChatSkeleton />
            ) : (
                <div className="bg-muted/5 custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-6">
                    {messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUserId;
                        const showAvatar =
                            !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    'flex max-w-[85%] gap-3 md:max-w-[70%]',
                                    isMe ? 'ml-auto flex-row-reverse' : '',
                                )}
                            >
                                {!isMe && (
                                    <div className="w-8 flex-shrink-0">
                                        {showAvatar && (
                                            <Avatar className="border-border h-8 w-8 border">
                                                <AvatarImage src={participant.avatar} />
                                                <AvatarFallback>
                                                    {participant.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                )}

                                <div
                                    className={cn(
                                        'rounded-2xl p-3 text-sm leading-relaxed shadow-sm md:p-4',
                                        isMe
                                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                            : 'bg-card border-border text-foreground rounded-tl-sm border',
                                    )}
                                >
                                    {msg.content}
                                    <div
                                        className={cn(
                                            'mt-1 flex justify-end text-[10px] opacity-70',
                                            isMe ? 'text-primary-foreground' : 'text-muted-foreground',
                                        )}
                                    >
                                        {format(new Date(msg.timestamp), 'h:mm a')}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Input Area */}
            <div className="bg-card border-border mt-auto shrink-0 border-t p-4 md:p-6">
                <div className="flex gap-2 items-end">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        rows={1}
                        className="bg-muted/50 border-input focus:ring-primary focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none py-3 px-4 resize-none flex-1 rounded-md border text-sm transition-[color,box-shadow] max-h-32 custom-scrollbar"
                        ref={(el) => {
                            if (el) {
                                el.style.height = 'auto';
                                el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
                            }
                        }}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        size="icon"
                        className="bg-primary hover:bg-primary/90 h-12 w-12 shrink-0 transition-colors rounded-md"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <ParticipantProfileDialog
                open={isProfileOpen}
                onOpenChange={setIsProfileOpen}
                participantId={participant?.id || null}
                connectionStatus={participant?.status}
            />
        </div>
    );
}

