import { CardHeader, CardTitle, CardDescription } from '@sentinel/ui';

export function LoginHeader() {
    return (
        <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-center text-gray-400">
                Enter your email to sign in to your account
            </CardDescription>
        </CardHeader>
    );
}
