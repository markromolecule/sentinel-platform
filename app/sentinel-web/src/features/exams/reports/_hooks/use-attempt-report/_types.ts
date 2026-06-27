import type {
    AttemptGradingDetailType,
    GradingQuestionType,
    UpdateGradingAttemptBodyType,
} from '@sentinel/shared';
import type { AttemptReportOverrideDrafts } from '../../attempt-report-utils';

export type UseAttemptReportProps = {
    attempt: AttemptGradingDetailType;
    questions: GradingQuestionType[];
    onSubmit?: (payload: {
        itemOverrides: NonNullable<UpdateGradingAttemptBodyType['itemOverrides']>;
        finalize: boolean;
    }) => void;
};

export type ReportCardType = AttemptGradingDetailType['questionReports'][number] & {
    question: GradingQuestionType | undefined;
};

export type UseAttemptReportReturn = {
    overrideDrafts: AttemptReportOverrideDrafts;
    selectedReport: ReportCardType | null;
    setSelectedReport: (report: ReportCardType | null) => void;
    reportCards: ReportCardType[];
    handleOverrideChange: (
        questionId: string,
        field: 'awardedScore' | 'reason',
        value: string,
    ) => void;
    handleSubmit: (finalize: boolean) => void;
};
