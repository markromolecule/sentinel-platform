'use client';

import { useRouter } from 'next/navigation';
import { PreviewHeader } from '../common/preview-header';
import { PreviewLoadingState } from '../preview-loading-state';
import { usePreviewExamData } from '../../_hooks/use-preview-exam-data';
import { buildPreviewHref } from '../preview-page-shell';
import { PreviewHighlightsList } from '../cards/preview-highlights-list';
import { ReadinessList } from '../lists/readiness-list';
import { PreviewPageHeader } from '../common/preview-page-header';
import { PreviewFooterActions } from '../common/preview-footer-actions';
import {
    COMMON_HIGHLIGHT_ICONS,
    LOBBY_READINESS_ITEMS
} from '../../_constants/preview-constants';

export function LobbyView() {
    const router = useRouter();
    const { examId, sessionId, exam, configuration, isLoading } = usePreviewExamData();

    if (isLoading) {
        return <PreviewLoadingState />;
    }

    const studentsInLobby = exam?.studentsCount ?? 0;

    const highlights = [
        {
            label: 'Duration',
            value: `${exam?.duration ?? 0} minutes`,
            icon: COMMON_HIGHLIGHT_ICONS.DurationLobby
        },
        {
            label: 'Lobby Count',
            value: `${studentsInLobby} students`,
            icon: COMMON_HIGHLIGHT_ICONS.LobbyCount
        },
        {
            label: 'Reconnect',
            value: `${configuration.maxReconnectAttempts} attempts`,
            icon: COMMON_HIGHLIGHT_ICONS.Reconnect
        },
        {
            label: 'Exam State',
            value: 'Ready for entry',
            icon: COMMON_HIGHLIGHT_ICONS.ExamState
        },
    ];

    return (
        <div className="bg-muted/20 selection:bg-primary/10 min-h-screen font-sans">
            <PreviewHeader examId={examId} badgeLabel="Lobby" />

            <main className="mx-auto max-w-4xl px-5 pb-8 sm:px-8 sm:pb-10">
                <section className="space-y-5 border-b pb-8">
                    <PreviewPageHeader
                        title="Lobby"
                        description="This is the final waiting area before the live attempt begins."
                    />

                    <PreviewHighlightsList highlights={highlights} />
                </section>

                <section className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.8fr)]">
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold sm:text-lg">Lobby status</h2>
                        <div className="text-muted-foreground space-y-4 text-sm leading-6 sm:text-[15px]">
                            <p>
                                Students who completed orientation, consent, and device checkup are
                                directed here before entering the live exam.
                            </p>
                            <p>
                                The lobby helps confirm that the student is ready and that the preview
                                flow can continue into the actual attempt screen.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-base font-semibold sm:text-lg">Before entry</h2>
                        <ReadinessList items={LOBBY_READINESS_ITEMS} />

                        <div className="bg-blue-50 dark:bg-blue-900/20 mt-4 rounded-lg p-4 text-sm leading-6 text-blue-900 dark:text-blue-200">
                            <p className="text-blue-800/80 dark:text-blue-200/80">
                                <span className="font-semibold">Note:</span> The lobby count in this
                                preview uses the current exam student total to represent how many
                                students are already waiting.
                            </p>
                        </div>
                    </div>
                </section>

                <PreviewFooterActions
                    primaryLabel="Continue to Attempt"
                    primaryOnClick={() => router.push(buildPreviewHref(examId, sessionId, 'attempt'))}
                    secondaryLabel="Previous Step"
                    secondaryHref={buildPreviewHref(examId, sessionId, 'checkup')}
                />
            </main>
        </div>
    );
}
