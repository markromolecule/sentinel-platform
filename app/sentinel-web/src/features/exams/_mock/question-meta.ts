import {
    AlignLeft,
    CheckCircle2,
    CircleDot,
    ClipboardList,
    ListChecks,
    Shuffle,
    LucideIcon,
} from 'lucide-react';
import type { QuestionType } from '../_types/exam';

export const QUESTION_TYPE_META: Record<
    QuestionType,
    { label: string; description: string; icon: LucideIcon }
> = {
    multiple_choice: {
        label: 'Multiple Choice',
        description: 'Select one correct option among choices.',
        icon: ListChecks,
    },
    multiple_response: {
        label: 'Multiple Response',
        description: 'Select multiple correct options among choices.',
        icon: CheckCircle2,
    },
    true_false: {
        label: 'True or False',
        description: 'Determine if a statement is correct or not.',
        icon: CircleDot,
    },
    identification: {
        label: 'Identification',
        description: 'Provide the correct term or concept required.',
        icon: ClipboardList,
    },
    matching: {
        label: 'Matching Type',
        description: 'Connect related items from separate lists.',
        icon: Shuffle,
    },
    enumeration: {
        label: 'Enumeration',
        description: 'List the items required in the correct order.',
        icon: AlignLeft,
    },
    fill_blank: {
        label: 'Fill in the Blank',
        description: 'Complete sentences with the correct word or phrase.',
        icon: ClipboardList,
    },
    essay: {
        label: 'Essay',
        description: 'Write a detailed response to a prompt or question.',
        icon: AlignLeft,
    },
};
