'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@sentinel/ui';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@sentinel/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@sentinel/ui';
import { useUserSearch } from '@sentinel/hooks';

interface UserSearchBarProps {
    redirectPath: string;
}

export function UserSearchBar({ redirectPath }: UserSearchBarProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { users, isLoading } = useUserSearch(searchQuery);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hidden sm:flex"
                >
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search users</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search users by name..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        {isLoading && searchQuery.length >= 2 ? (
                            <div className="text-muted-foreground p-4 text-center text-xs">
                                Searching...
                            </div>
                        ) : searchQuery.length < 2 ? (
                            <div className="text-muted-foreground p-4 text-center text-xs">
                                Type at least 2 characters to search...
                            </div>
                        ) : users.length === 0 ? (
                            <CommandEmpty>No users found.</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {users.map((user) => {
                                    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
                                    return (
                                        <CommandItem
                                            key={user.id}
                                            value={user.id}
                                            onSelect={() => {
                                                router.push(`${redirectPath}?userId=${user.id}`);
                                                setOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="flex cursor-pointer items-center gap-3 p-2"
                                        >
                                            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                                                {initials}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">
                                                    {user.firstName} {user.lastName}
                                                </span>
                                                <span className="text-muted-foreground text-xs capitalize">
                                                    {user.role}
                                                </span>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
