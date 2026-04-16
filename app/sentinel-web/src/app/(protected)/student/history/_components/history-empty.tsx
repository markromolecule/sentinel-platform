import { Award } from 'lucide-react';

export function HistoryEmpty() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 bg-white/5 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <Award className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">No history found</h3>
            <p className="mx-auto max-w-md text-white/40">
                Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
        </div>
    );
}
