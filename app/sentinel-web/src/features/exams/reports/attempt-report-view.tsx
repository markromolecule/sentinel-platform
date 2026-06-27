import type {
    AttemptGradingDetailType,
    GradingQuestionType,
    UpdateGradingAttemptBodyType,
} from '@sentinel/shared';
import { useAttemptReport } from './_hooks/use-attempt-report';
import { AttemptReportActions } from './_components/attempt-report-actions';
import { AttemptReportSummaryCards } from './_components/attempt-report-summary-cards';
import { AttemptReportTable } from './_components/attempt-report-table';
import { AttemptReportOverrideDialog } from './_components/attempt-report-override-dialog';

export type AttemptReportViewProps = {
    attempt: AttemptGradingDetailType;
    questions: GradingQuestionType[];
    editable?: boolean;
    isSubmitting?: boolean;
    onSubmit?: (payload: {
        itemOverrides: NonNullable<UpdateGradingAttemptBodyType['itemOverrides']>;
        finalize: boolean;
    }) => void;
};

/**
 * Renders a modular exam attempt report displaying summary cards, a questions table,
 * actions panel, and an override adjustments modal dialog.
 *
 * @param props - AttemptReportViewProps containing attempt data and submit handlers.
 */
export function AttemptReportView({
    attempt,
    questions,
    editable = false,
    isSubmitting = false,
    onSubmit,
}: AttemptReportViewProps) {
    const {
        overrideDrafts,
        selectedReport,
        setSelectedReport,
        reportCards,
        handleOverrideChange,
        handleSubmit,
    } = useAttemptReport({ attempt, questions, onSubmit });

    const selectedIndex = selectedReport ? reportCards.indexOf(selectedReport) : -1;

    return (
        <div className="space-y-6">
            <AttemptReportSummaryCards attempt={attempt} />

            <AttemptReportTable
                reportCards={reportCards}
                editable={editable}
                onRowClick={setSelectedReport}
            />

            <AttemptReportActions
                editable={editable}
                hasSubmitHandler={Boolean(onSubmit)}
                isSubmitting={isSubmitting}
                onSaveOverrides={() => handleSubmit(false)}
                onSaveAndFinalize={() => handleSubmit(true)}
            />

            {selectedReport && (
                <AttemptReportOverrideDialog
                    selectedReport={selectedReport}
                    open={!!selectedReport}
                    onOpenChange={(open) => !open && setSelectedReport(null)}
                    overrideDraft={overrideDrafts[selectedReport.questionId]}
                    onOverrideChange={handleOverrideChange}
                    questionIndex={selectedIndex}
                />
            )}
        </div>
    );
}
