import { ConfigToggleRow } from './config-toggle-row';

const EXAM_RULE_OPTIONS = [
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
];

export function ExamRulesSection() {
    return (
        <div className="space-y-3">
            {EXAM_RULE_OPTIONS.map((option) => (
                <ConfigToggleRow
                    key={option.name}
                    name={option.name}
                    label={option.label}
                    description={option.description}
                />
            ))}
        </div>
    );
}
