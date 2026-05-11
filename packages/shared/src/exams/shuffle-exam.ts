import { deterministicShuffle } from '../utils/deterministic-shuffle';
import type { ExamQuestion } from '../types';

/**
 * Shuffles questions in an exam deterministically.
 */
export function shuffleExamQuestions(questions: ExamQuestion[], seed: string): ExamQuestion[] {
    return deterministicShuffle(questions, seed);
}

/**
 * Randomizes the choices of a single question and updates the correct answer index/indices.
 */
export function randomizeQuestionChoices(question: ExamQuestion, seed: string): ExamQuestion {
    const options = question.content.options;

    if (!options || options.length === 0) {
        return question;
    }

    const originalCorrectAnswer = question.content.correctAnswer;

    // Create an array of indices [0, 1, 2, ...]
    const indices = options.map((_, i) => i);
    // Shuffle the indices
    const shuffledIndices = deterministicShuffle(indices, seed);

    // Create the new options array based on shuffled indices
    const newOptions = shuffledIndices.map((i) => options[i] ?? '');

    // Create a mapping from old index to new index
    // oldIndex i is now at newIndex j such that shuffledIndices[j] === i
    const oldToNewMapping: Record<number, number> = {};
    shuffledIndices.forEach((oldIndex, newIndex) => {
        oldToNewMapping[oldIndex] = newIndex;
    });

    let newCorrectAnswer = originalCorrectAnswer;

    if (typeof originalCorrectAnswer === 'number') {
        newCorrectAnswer = oldToNewMapping[originalCorrectAnswer] ?? originalCorrectAnswer;
    } else if (Array.isArray(originalCorrectAnswer)) {
        newCorrectAnswer = (originalCorrectAnswer as any[]).map((ans) =>
            typeof ans === 'number' ? (oldToNewMapping[ans] ?? ans) : ans,
        ) as string[] | number[];
    }

    return {
        ...question,
        content: {
            ...question.content,
            options: newOptions,
            correctAnswer: newCorrectAnswer,
        },
    };
}
