import { ExamHistory } from '../../../index';

export interface ExamHeaderProps {
    subject: string;
    status: ExamHistory['status'];
}

export interface ExamInfoProps {
    title: string;
    primaryDateLabel: string;
    primaryDateValue: string | null;
    timeSpent: number | null;
}

export interface ExamDetailStatsProps {
    score: number | null;
    totalScore: number | null;
    percentage: number | null;
}

export interface ExamHeroScoreProps {
    percentage: number | null;
    result: ExamHistory['result'];
}
