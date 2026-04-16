import { Input } from '@sentinel/ui';
import { Search } from 'lucide-react';
import { type ExamSearchProps } from '@sentinel/shared/types';

export function ExamSearch({ value, onChange }: ExamSearchProps) {
    return (
        <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="text-muted-foreground group-focus-within:text-primary h-5 w-5 transition-colors" />
            </div>
            <Input
                type="text"
                placeholder="Search your exams..."
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-14 rounded-xl pl-11 text-lg transition-all"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
