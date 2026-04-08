import type { Metadata } from "next";
import NextImage from "next/image";

export const metadata: Metadata = {
    title: "Support Portal",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dark relative min-h-screen overflow-hidden bg-[#0f0f10] text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(50,61,143,0.34)_0%,rgba(15,15,16,0.98)_40%,rgba(15,15,16,1)_68%,rgba(70,84,233,0.18)_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(70,84,233,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(50,61,143,0.18),transparent_32%)]" />
            <div className="pointer-events-none absolute left-1/2 top-20 h-48 w-48 -translate-x-1/2 rounded-full bg-[rgba(70,84,233,0.18)] blur-3xl" />
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center px-4 py-12 sm:px-6">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="relative mb-6 h-14 w-14 sm:h-16 sm:w-16">
                        <NextImage
                            src="/icons/icon0.svg"
                            alt="Sentinel"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
