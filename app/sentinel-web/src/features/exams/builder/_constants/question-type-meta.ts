import type { LucideIcon } from 'lucide-react';
import {
    AlignLeft,
    CheckCircle2,
    CircleDot,
    ClipboardList,
    ListChecks,
    Shuffle,
} from 'lucide-react';
import type { QuestionType } from '@sentinel/shared/types';
import type { QuestionTypeDefinition } from '@sentinel/services';

export type QuestionTypeMeta = {
    label: string;
    description: string;
    icon: LucideIcon;
};

export const QUESTION_TYPE_META: Record<QuestionType, QuestionTypeMeta> = {
    MULTIPLE_CHOICE: {
        label: 'Multiple Choice',
        description: 'Select one correct option among choices.',
        icon: ListChecks,
    },
    MULTIPLE_RESPONSE: {
        label: 'Multiple Response',
        description: 'Select multiple correct options among choices.',
        icon: CheckCircle2,
    },
    TRUE_FALSE: {
        label: 'True or False',
        description: 'Determine if a statement is correct or not.',
        icon: CircleDot,
    },
    IDENTIFICATION: {
        label: 'Identification',
        description: 'Provide the correct term or concept required.',
        icon: ClipboardList,
    },
    ENUMERATION: {
        label: 'Enumeration',
        description: 'List the items required in the correct order.',
        icon: AlignLeft,
    },
    ESSAY: {
        label: 'Essay',
        description: 'Write a detailed response to a prompt or question.',
        icon: AlignLeft,
    },
    FILL_BLANK: {
        label: 'Fill in the Blank',
        description: 'Complete sentences with the correct word or phrase.',
        icon: ClipboardList,
    },
    MATCHING: {
        label: 'Matching Type',
        description: 'Connect related items from separate lists.',
        icon: Shuffle,
    },
};

export function getQuestionTypeMeta(
    type: QuestionType,
    definition?: Pick<QuestionTypeDefinition, 'label' | 'description'>,
): QuestionTypeMeta {
    const fallback = QUESTION_TYPE_META[type];

    return {
        icon: fallback.icon,
        label: definition?.label ?? fallback.label,
        description: definition?.description ?? fallback.description,
    };
}
