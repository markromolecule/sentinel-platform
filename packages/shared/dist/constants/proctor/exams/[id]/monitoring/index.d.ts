import React from 'react';
import { FlagType, StudentSession } from '../../../../../types/proctor/exams/[id]/monitoring';
export declare const MOCK_EXAM: {
    id: string;
    title: string;
    subject: string;
    duration: number;
    startedAt: string;
    endsAt: string;
};
export declare const MOCK_STUDENTS: StudentSession[];
export declare const flagIcons: Record<FlagType, React.ReactNode>;
export declare const flagLabels: Record<FlagType, string>;
export declare const severityColors: Record<string, string>;
export declare const statusConfig: Record<string, {
    color: string;
    icon: React.ReactNode;
    label: string;
}>;
//# sourceMappingURL=index.d.ts.map