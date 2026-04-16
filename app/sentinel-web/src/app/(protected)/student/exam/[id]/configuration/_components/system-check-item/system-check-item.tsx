import { CheckCircle } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { SystemCheckItemProps } from '@sentinel/shared/types';

export function SystemCheckItem({ icon, title, description, status }: SystemCheckItemProps) {
    return (
        <div className="hover:bg-muted/30 flex items-center justify-between p-2.5 transition-colors sm:p-3">
            <div className="flex items-center gap-2 sm:gap-2.5">
                <div
                    className={cn(
                        'rounded-md p-1.5',
                        status === 'success' && 'bg-green-500/10 text-green-500',
                        status === 'pending' && 'bg-muted text-muted-foreground',
                        status === 'info' && 'bg-blue-500/10 text-blue-500',
                    )}
                >
                    {icon}
                </div>
                <div>
                    <div className="text-xs font-medium sm:text-sm">{title}</div>
                    <div className="text-muted-foreground text-[10px] sm:text-[11px]">
                        {description}
                    </div>
                </div>
            </div>
            {status === 'success' && (
                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
            )}
        </div>
    );
}
