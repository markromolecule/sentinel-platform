import { CardHeader, CardTitle, CardDescription } from '@sentinel/ui';

export function RegisterHeader() {
    return (
        <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">Create an account</CardTitle>
            <CardDescription className="text-center text-gray-400">
                Enter your information to get started with Sentinel
            </CardDescription>
        </CardHeader>
    );
}
