"use client";

import { useTheme } from "next-themes";
import {
    Settings,
    Sun,
    Moon,
    Monitor,
    LogOut,
    Check
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@sentinel/ui";
import { useUser } from "@/hooks/use-user";
import { useLogoutMutation } from "@/hooks/query/auth/use-logout-mutation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DashboardProfileDropdown() {
    const { theme, setTheme } = useTheme();
    const { data: user } = useUser();
    const router = useRouter();

    const { mutate: logout } = useLogoutMutation({
        onSuccess: () => {
            router.refresh();
            router.push("/auth/login");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const themeOptions = [
        { name: "Light", value: "light", icon: Sun },
        { name: "Dark", value: "dark", icon: Moon },
        { name: "System", value: "system", icon: Monitor },
    ];

    if (!user) return null;

    const firstName = user.user_metadata?.firstName || "User";
    const lastName = user.user_metadata?.lastName || "";
    const email = user.email || "";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
                    {firstName[0]}{lastName ? lastName[0] : ""}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1 mt-2">
                <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold leading-none">{firstName} {lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />

                <div className="space-y-0.5">
                    <DropdownMenuItem className="cursor-pointer gap-2 py-1.5">
                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">Account preferences</span>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <div className="px-2 py-1.5">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">Theme</p>
                    <div className="space-y-0.5">
                        {themeOptions.map((opt) => (
                            <DropdownMenuItem
                                key={opt.value}
                                className="cursor-pointer justify-between py-1.5 px-2 focus:bg-accent"
                                onClick={() => setTheme(opt.value)}
                            >
                                <div className="flex items-center gap-2">
                                    <opt.icon className="h-3.5 w-3.5" />
                                    <span className="text-sm">{opt.name}</span>
                                </div>
                                {theme === opt.value && (
                                    <Check className="h-3 w-3 text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </div>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                    className="text-foreground focus:text-foreground focus:bg-accent cursor-pointer py-1.5 px-2"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    <span className="text-sm">Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function DashboardProfileDropdownFallback() {
    return (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold animate-pulse cursor-pointer shadow-sm" />
    );
}
