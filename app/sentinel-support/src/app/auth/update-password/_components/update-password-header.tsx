import { CardHeader } from '@sentinel/ui';
import { ShieldCheck } from 'lucide-react';

export function UpdatePasswordHeader() {
    return (
        <CardHeader className="relative z-10 space-y-2 pb-2 text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 p-4 ring-1 ring-blue-500/20">
                <ShieldCheck className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                Activate Support Access
            </h1>
            <p className="text-sm text-gray-400">
                Create a secure password to finish setting up your support account.
            </p>
        </CardHeader>
    );
}
