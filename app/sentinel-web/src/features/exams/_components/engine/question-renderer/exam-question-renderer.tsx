import type { ExamQuestionRendererProps } from '../types';
import { getQuestionPrompt } from '../utils';
import {
    MultipleChoiceQuestion,
    MultipleResponseQuestion,
    TrueFalseQuestion,
    IdentificationQuestion,
    EssayQuestion,
    FillBlankQuestion,
    MatchingQuestion,
    EnumerationQuestion,
    UnsupportedQuestion,
} from './_components';

export function ExamQuestionRenderer({
    question,
    value,
    onChange,
    showCorrectAnswer = false,
    crossOutEnabled = false,
    crossedOutOptions = [],
    onToggleOptionCrossOut,
}: ExamQuestionRendererProps) {
    return (
        <div className="space-y-5">
            <div className="space-y-3">
                <h2 className="text-foreground text-xl font-semibold leading-8 sm:text-2xl">
                    {getQuestionPrompt(question)}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {question.points} point{question.points === 1 ? '' : 's'}
                </p>
            </div>

            {question.type === 'MULTIPLE_CHOICE' ? (
                <MultipleChoiceQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                    crossOutEnabled={crossOutEnabled}
                    crossedOutOptions={crossedOutOptions}
                    onToggleOptionCrossOut={onToggleOptionCrossOut}
                />
            ) : question.type === 'MULTIPLE_RESPONSE' ? (
                <MultipleResponseQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                    crossOutEnabled={crossOutEnabled}
                    crossedOutOptions={crossedOutOptions}
                    onToggleOptionCrossOut={onToggleOptionCrossOut}
                />
            ) : question.type === 'TRUE_FALSE' ? (
                <TrueFalseQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : question.type === 'IDENTIFICATION' ? (
                <IdentificationQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : question.type === 'ESSAY' ? (
                <EssayQuestion question={question} value={value} onChange={onChange} />
            ) : question.type === 'FILL_BLANK' ? (
                <FillBlankQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : question.type === 'MATCHING' ? (
                <MatchingQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : question.type === 'ENUMERATION' ? (
                <EnumerationQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : (
                <UnsupportedQuestion />
            )}
        </div>
    );
}
