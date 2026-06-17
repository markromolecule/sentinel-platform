import { ConfigToggleRow } from './config-toggle-row';
import type { ExamConfigurationState } from '@sentinel/services';
import type { FieldPath } from 'react-hook-form';

type ExamRuleOption = {
    name: FieldPath<ExamConfigurationState>;
    label: string;
    description: string;
    getChecked?: (value: unknown) => boolean;
    getValue?: (checked: boolean) => unknown;
};

export const EXAM_RULE_OPTIONS: ExamRuleOption[] = [
    {
        name: 'settings.shuffleQuestions' as const,
        label: 'Shuffle questions',
        description: 'Present questions in a varied order for each student attempt.',
    },
    {
        name: 'settings.randomizeChoices' as const,
        label: 'Randomize answer choices',
        description: 'Change option order inside supported multiple-choice questions.',
    },
    {
        name: 'settings.allowReview' as const,
        label: 'Allow review before submission',
        description:
            'Let students revisit previous questions while the attempt is still in progress.',
    },
    {
        name: 'settings.showCorrectAnswers' as const,
        label: 'Show correct answers',
        description: 'Reveal correct responses after submission when post-exam review is allowed.',
    },
    {
        name: 'configuration.lobbyAdmissionMode' as const,
        label: 'Require instructor admit',
        description: 'Hold students in the lobby until an instructor admits them.',
        getChecked: (value: unknown) => value === 'INSTRUCTOR_GATED',
        getValue: (checked: boolean) => (checked ? 'INSTRUCTOR_GATED' : 'AUTOMATIC'),
    },
];

/**
 * ExamRulesSection renders the shared exam rule toggles inside the configuration form.
 *
 * @returns The exam rules toggle group.
 */
export function ExamRulesSection() {
    return (
        <div className="space-y-3">
            {EXAM_RULE_OPTIONS.map((option) => (
                <ConfigToggleRow
                    key={option.name}
                    name={option.name}
                    label={option.label}
                    description={option.description}
                    getChecked={option.getChecked}
                    getValue={option.getValue}
                />
            ))}
        </div>
    );
}
