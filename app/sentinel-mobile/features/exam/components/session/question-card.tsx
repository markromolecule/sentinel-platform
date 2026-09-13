import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import type { QuestionCardProps } from './inputs/question-card.types';
import {
    QuestionCardUnavailable,
    QuestionCardHeader,
    MultipleChoiceInput,
    MultipleResponseInput,
    TrueFalseInput,
    MatchingInput,
    FillBlankInput,
    EnumerationInput,
    EssayInput,
    normalizeQuestionType,
    resolveTextValue,
    resolveSelectedSingleId,
    resolveSelectedIds,
    resolveMatchingValues,
    resolveBlankValues,
} from './inputs';
import { PassageCard } from './passage-card';

export type { QuestionCardProps };

/**
 * QuestionCard renders a single exam question with type-specific input UI.
 * Supports MULTIPLE_CHOICE, MULTIPLE_RESPONSE, TRUE_FALSE, IDENTIFICATION,
 * ESSAY, FILL_BLANK, ENUMERATION, and MATCHING question types.
 * Displays an optional reading passage (PassageCard) above the prompt when present.
 *
 * IMPORTANT: Sub-components are rendered as JSX elements (<Component ... />) rather
 * than plain function calls (Component({...})). Calling React components as plain
 * functions bypasses React's reconciliation, key tracking, and lifecycle hooks,
 * which can silently prevent rendering in React Native / Expo.
 */
export const QuestionCard = ({
    question,
    currentIndex,
    totalQuestions,
    selectedOptionId,
    isFlagged,
    onSelectOption,
    onToggleFlag,
}: QuestionCardProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme ?? 'light'];

    if (!question) {
        return <QuestionCardUnavailable colors={colors} />;
    }

    const {
        type,
        text,
        options = [],
        pairs = [],
        blanks = [],
        passage,
        passageTitle,
        placeholder,
        maxLength,
    } = question;

    const points = typeof question.points === 'number' ? question.points : 1;
    const normalizedType = normalizeQuestionType(type);

    const selectedIds = resolveSelectedIds(selectedOptionId);
    const selectedSingleId = resolveSelectedSingleId(selectedOptionId);
    const currentTextValue = resolveTextValue(selectedOptionId);
    const matchingValues = resolveMatchingValues(selectedOptionId);
    const blankValues = resolveBlankValues(selectedOptionId);

    const isKnownType = [
        'MULTIPLE_CHOICE',
        'MULTIPLE_RESPONSE',
        'TRUE_FALSE',
        'MATCHING',
        'FILL_BLANK',
        'ENUMERATION',
        'ESSAY',
        'IDENTIFICATION',
    ].includes(normalizedType);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Question Header */}
            <QuestionCardHeader
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                points={points}
                isFlagged={isFlagged}
                isDark={isDark}
                colors={colors}
                onToggleFlag={onToggleFlag}
            />

            {/* Reading Passage */}
            {passage ? <PassageCard passage={passage} title={passageTitle} /> : null}

            {/* Question Text */}
            <Text
                style={{ color: colors.text }}
                className="mb-6 text-lg font-semibold leading-relaxed"
            >
                {text || 'Question prompt unavailable.'}
            </Text>

            {/* ── Type-Specific Input Views ── */}
            {normalizedType === 'MULTIPLE_CHOICE' && (
                <MultipleChoiceInput
                    options={options}
                    selectedSingleId={selectedSingleId}
                    currentTextValue={currentTextValue}
                    placeholder={placeholder}
                    isDark={isDark}
                    colors={colors}
                    onSelectOption={onSelectOption}
                />
            )}

            {normalizedType === 'MULTIPLE_RESPONSE' && (
                <MultipleResponseInput
                    options={options}
                    selectedIds={selectedIds}
                    currentTextValue={currentTextValue}
                    placeholder={placeholder}
                    isDark={isDark}
                    colors={colors}
                    onSelectOption={onSelectOption}
                />
            )}

            {normalizedType === 'TRUE_FALSE' && (
                <TrueFalseInput
                    options={options}
                    selectedOptionId={selectedOptionId}
                    selectedSingleId={selectedSingleId}
                    isDark={isDark}
                    colors={colors}
                    onSelectOption={onSelectOption}
                />
            )}

            {normalizedType === 'MATCHING' && (
                <MatchingInput
                    pairs={pairs}
                    matchingValues={matchingValues}
                    currentTextValue={currentTextValue}
                    placeholder={placeholder}
                    isDark={isDark}
                    colors={colors}
                    onSelectOption={onSelectOption}
                />
            )}

            {normalizedType === 'FILL_BLANK' && (
                <FillBlankInput
                    blanks={blanks}
                    blankValues={blankValues}
                    currentTextValue={currentTextValue}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    colors={colors}
                    onSelectOption={onSelectOption}
                />
            )}

            {normalizedType === 'ENUMERATION' && (
                <EnumerationInput
                    blanks={blanks}
                    blankValues={blankValues}
                    maxLength={maxLength}
                    colors={colors}
                    onSelectOption={onSelectOption}
                />
            )}

            {(normalizedType === 'ESSAY' ||
                normalizedType === 'IDENTIFICATION' ||
                !isKnownType) && (
                <EssayInput
                    normalizedType={normalizedType}
                    currentTextValue={currentTextValue}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    colors={colors}
                    onSelectOption={onSelectOption}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
});
