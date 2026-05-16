'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { getSupportPortalUrl } from '@/lib/support-portal';

export default function SupportRedirectPage() {
    useEffect(() => {
        window.location.href = getSupportPortalUrl();
    }, []);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
    );
}
