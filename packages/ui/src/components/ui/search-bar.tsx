import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from './input';
import { cn } from '../../lib/utils';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string;
}

export function SearchBar({ className, containerClassName, ...props }: SearchBarProps) {
    return (
        <div className={cn('relative isolate flex items-center', containerClassName)}>
            <div className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2">
                <Search className="text-muted-foreground h-4 w-4" />
            </div>
            <Input {...props} className={cn('py-0 pl-11 leading-none', className)} />
        </div>
    );
}
