'use client';

import { MessagingPageClient } from '@/features/messaging';
import { Suspense } from 'react';

export default function StudentMessagePage() {
    return (
        <Suspense fallback={<div>Loading inbox...</div>}>
            <MessagingPageClient />
        </Suspense>
    );
}
