import type { ExamCreateFormValues } from '../../../schema/proctor/exams/exam-create-schema';
export declare const EXAM_STATUS_OPTIONS: readonly [{
    readonly label: "Active";
    readonly value: "active";
}, {
    readonly label: "Draft";
    readonly value: "draft";
}, {
    readonly label: "Completed";
    readonly value: "completed";
}, {
    readonly label: "Scheduled";
    readonly value: "scheduled";
}];
export declare const EXAM_FILTER_TABS: readonly [{
    readonly value: "all";
    readonly label: "All";
}, {
    readonly label: "Active";
    readonly value: "active";
}, {
    readonly label: "Draft";
    readonly value: "draft";
}, {
    readonly label: "Completed";
    readonly value: "completed";
}, {
    readonly label: "Scheduled";
    readonly value: "scheduled";
}];
export declare const EXAM_DIFFICULTY_OPTIONS: readonly [{
    readonly label: "Easy";
    readonly value: "EASY";
}, {
    readonly label: "Medium";
    readonly value: "MEDIUM";
}, {
    readonly label: "Hard";
    readonly value: "HARD";
}];
export declare const QUESTION_TYPE_OPTIONS: readonly [{
    readonly label: "Multiple Choice";
    readonly value: "MULTIPLE_CHOICE";
}, {
    readonly label: "True/False";
    readonly value: "TRUE_FALSE";
}, {
    readonly label: "Identification";
    readonly value: "IDENTIFICATION";
}, {
    readonly label: "Essay";
    readonly value: "ESSAY";
}, {
    readonly label: "Enumeration";
    readonly value: "ENUMERATION";
}];
export declare const EXAM_CREATE_FORM_DEFAULTS: ExamCreateFormValues;
//# sourceMappingURL=exam-constants.d.ts.map