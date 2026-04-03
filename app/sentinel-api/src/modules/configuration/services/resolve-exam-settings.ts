import type {
    ExamConfigurationPayload,
    ExamSettingsState,
} from './configuration.types';

export function resolveExamSettings(args: {
    payload: ExamConfigurationPayload;
    fallback?: ExamSettingsState;
}) {
    const { payload, fallback } = args;

    return {
        shuffleQuestions:
            payload.settings?.shuffleQuestions ??
            payload.shuffleQuestions ??
            fallback?.shuffleQuestions ??
            false,
        showCorrectAnswers:
            payload.settings?.showCorrectAnswers ??
            payload.showCorrectAnswers ??
            fallback?.showCorrectAnswers ??
            false,
        allowReview:
            payload.settings?.allowReview ?? payload.allowReview ?? fallback?.allowReview ?? false,
        randomizeChoices:
            payload.settings?.randomizeChoices ??
            payload.randomizeChoices ??
            fallback?.randomizeChoices ??
            false,
    };
}
