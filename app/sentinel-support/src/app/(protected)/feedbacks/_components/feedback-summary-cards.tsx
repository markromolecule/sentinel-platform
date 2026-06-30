'use client';

import { MessageSquareText, School2, Star } from 'lucide-react';
import { StatsCard } from '@/components/common/stats-card';
import type { FeedbackPage } from '@sentinel/services';

function computeAverageRating(page: FeedbackPage) {
    if (page.items.length === 0) {
        return '0.0';
    }

    const total = page.items.reduce((sum, item) => sum + item.rating, 0);
    return (total / page.items.length).toFixed(1);
}

export function FeedbackSummaryCards({ page }: { page: FeedbackPage }) {
    const institutions = new Set(page.items.map((item) => item.institutionId).filter(Boolean));

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatsCard
                title="Feedback Records"
                value={page.total}
                description="Across the current server-side query"
                icon={MessageSquareText}
            />
            <StatsCard
                title="Average Rating"
                value={computeAverageRating(page)}
                description="Average across the current page"
                icon={Star}
            />
            <StatsCard
                title="Institutions In View"
                value={institutions.size}
                description="Distinct institutions on the current page"
                icon={School2}
            />
        </div>
    );
}
