import { CardHeader, CardTitle, CardDescription } from "@sentinel/ui";

export function LoginHeader() {
    return (
        <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Support Portal</CardTitle>
            <CardDescription className="text-center text-gray-400">
                Enter your email to sign in to your support account
            </CardDescription>
        </CardHeader>
    );
}
