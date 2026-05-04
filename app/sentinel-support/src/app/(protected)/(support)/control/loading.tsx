import { Spinner } from '@sentinel/ui';

export default function Loading() {
    return (
        <div className="flex h-[400px] w-full items-center justify-center">
            <Spinner className="text-primary h-8 w-8" />
        </div>
    );
}
