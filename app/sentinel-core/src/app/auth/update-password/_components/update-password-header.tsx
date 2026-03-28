import { CardHeader } from "@sentinel/ui";
import { ShieldCheck } from "lucide-react";

export function UpdatePasswordHeader() {
    return (
        <CardHeader className="space-y-2 text-center pb-2 relative z-10">
            <div className="mx-auto bg-blue-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2 ring-1 ring-blue-500/20">
                <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                Secure Account
            </h1>
            <p className="text-sm text-gray-400">
                Welcome! Please create a secure password to activate your account.
            </p>
        </CardHeader>
    );
}
