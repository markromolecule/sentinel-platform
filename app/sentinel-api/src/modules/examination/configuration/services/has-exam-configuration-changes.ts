import type { ExamConfigurationPayload } from './configuration.types';

export function hasExamConfigurationChanges(payload: ExamConfigurationPayload) {
    return (
        payload.settings !== undefined ||
        payload.configuration !== undefined ||
        payload.shuffleQuestions !== undefined ||
        payload.showCorrectAnswers !== undefined ||
        payload.allowReview !== undefined ||
        payload.randomizeChoices !== undefined
    );
}
