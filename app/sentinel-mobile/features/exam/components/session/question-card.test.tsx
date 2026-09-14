import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';
import type { MobileSessionQuestion } from '@/features/exam/lib/mobile-exam-adapter';
import { QuestionCard } from './question-card';

vi.mock('react-native', () => ({
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    ScrollView: 'ScrollView',
    TextInput: 'TextInput',
    StyleSheet: {
        create: <T extends Record<string, unknown>>(styles: T) => styles,
    },
    useColorScheme: () => 'light',
}));

vi.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

vi.mock('@/constants/theme', () => ({
    Colors: {
        light: {
            text: '#000',
            icon: '#555',
            card: '#fff',
            primary: '#6366f1',
            border: '#e5e7eb',
            background: '#fff',
        },
        dark: {
            text: '#fff',
            icon: '#aaa',
            card: '#1f2937',
            primary: '#818cf8',
            border: '#374151',
            background: '#111827',
        },
    },
}));

type QuestionType = MobileSessionQuestion['type'];

interface RenderQuestionCardOptions {
    question: MobileSessionQuestion | null | undefined;
    currentIndex?: number;
    totalQuestions?: number;
    selectedOptionId?: unknown;
    isFlagged?: boolean;
    onSelectOption?: (optionId: unknown) => void;
    onToggleFlag?: () => void;
    onRenderStatusChange?: (status: unknown) => void;
}

function makeQuestion(
    type: QuestionType,
    overrides: Partial<MobileSessionQuestion> = {},
): MobileSessionQuestion {
    return {
        id: 'q-1',
        text: 'Sample question?',
        type,
        points: 1,
        options: [],
        passage: null,
        passageTitle: null,
        originalContent: {
            prompt: overrides.text ?? 'Sample question?',
        },
        ...overrides,
    };
}

function renderQuestionCard({
    question,
    currentIndex = 0,
    totalQuestions = 1,
    selectedOptionId,
    isFlagged = false,
    onSelectOption = () => undefined,
    onToggleFlag = () => undefined,
    onRenderStatusChange,
}: RenderQuestionCardOptions): ReactTestRenderer {
    let renderer: ReactTestRenderer | undefined;

    act(() => {
        renderer = create(
            <QuestionCard
                question={question}
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                selectedOptionId={selectedOptionId}
                isFlagged={isFlagged}
                onSelectOption={onSelectOption}
                onToggleFlag={onToggleFlag}
                onRenderStatusChange={onRenderStatusChange}
            />,
        );
    });

    if (!renderer) {
        throw new Error('QuestionCard renderer was not created.');
    }

    return renderer;
}

function textContent(node: ReactTestInstance | string | number | null): string {
    if (node === null) return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);

    return node.children
        .map((child) => textContent(child as ReactTestInstance | string | number | null))
        .join('');
}

function hasText(renderer: ReactTestRenderer, content: string): boolean {
    return renderer.root.findAll((node) => textContent(node).includes(content)).length > 0;
}

function findHost(
    renderer: ReactTestRenderer,
    type: string,
    predicate: (node: ReactTestInstance) => boolean = () => true,
): ReactTestInstance | null {
    return renderer.root.findAll((node) => node.type === type && predicate(node))[0] ?? null;
}

function findAllHosts(
    renderer: ReactTestRenderer,
    type: string,
    predicate: (node: ReactTestInstance) => boolean = () => true,
): ReactTestInstance[] {
    return renderer.root.findAll((node) => node.type === type && predicate(node));
}

describe('QuestionCard native render contract', () => {
    it('renders the unavailable state when question is null', () => {
        const renderer = renderQuestionCard({ question: null, totalQuestions: 5 });
        const unavailable = findHost(
            renderer,
            'View',
            (node) => node.props.accessibilityLabel === 'Question unavailable',
        );

        expect(unavailable?.props.accessibilityRole).toBe('alert');
        expect(hasText(renderer, 'Question Unavailable')).toBe(true);
        expect(hasText(renderer, 'Question details could not be loaded')).toBe(true);
    });

    it('renders the unavailable state when question is undefined', () => {
        const renderer = renderQuestionCard({
            question: undefined,
            currentIndex: 2,
            totalQuestions: 10,
        });

        expect(
            findHost(renderer, 'View', (node) => node.props.accessibilityLabel === 'Question unavailable'),
        ).not.toBeNull();
    });

    it.each([
        {
            type: 'MULTIPLE_CHOICE',
            question: makeQuestion('MULTIPLE_CHOICE', {
                text: 'What is 2+2?',
                options: [
                    { id: 'A', text: '3' },
                    { id: 'B', text: '4' },
                ],
            }),
            expectedText: 'What is 2+2?',
            expectedControl: (renderer: ReactTestRenderer) => (
                findHost(renderer, 'TouchableOpacity', (node) => node.props.accessibilityRole === 'radio')
            ),
        },
        {
            type: 'MULTIPLE_RESPONSE',
            question: makeQuestion('MULTIPLE_RESPONSE', {
                options: [
                    { id: 'A', text: 'One' },
                    { id: 'B', text: 'Two' },
                ],
            }),
            expectedText: 'Select all that apply',
            expectedControl: (renderer: ReactTestRenderer) => (
                findHost(renderer, 'TouchableOpacity', (node) => node.props.accessibilityRole === 'checkbox')
            ),
        },
        {
            type: 'TRUE_FALSE',
            question: makeQuestion('TRUE_FALSE', {
                options: [
                    { id: 'true', text: 'True' },
                    { id: 'false', text: 'False' },
                ],
            }),
            expectedText: 'True',
            expectedControl: (renderer: ReactTestRenderer) => (
                findHost(renderer, 'TouchableOpacity', (node) => node.props.accessibilityRole === 'radio')
            ),
        },
        {
            type: 'MATCHING',
            question: makeQuestion('MATCHING', {
                pairs: [
                    { left: 'Left Item 1', right: 'Right Item 1' },
                    { left: 'Left Item 2', right: 'Right Item 2' },
                ],
            }),
            expectedText: 'Left Item 1',
            expectedControl: (renderer: ReactTestRenderer) => (
                findHost(renderer, 'TextInput', (node) => node.props.accessibilityLabel === 'Match for Left Item 1')
            ),
        },
        {
            type: 'FILL_BLANK',
            question: makeQuestion('FILL_BLANK', {
                blanks: ['Blank 1', 'Blank 2'],
            }),
            expectedText: 'Blank 1',
            expectedControl: (renderer: ReactTestRenderer) => (
                findHost(renderer, 'TextInput', (node) => node.props.accessibilityLabel === 'Blank 1')
            ),
        },
        {
            type: 'ENUMERATION',
            question: makeQuestion('ENUMERATION', {
                blanks: [],
            }),
            expectedText: 'Item 1',
            expectedControl: (renderer: ReactTestRenderer) => (
                findHost(renderer, 'TextInput', (node) => node.props.accessibilityLabel === 'Item 1')
            ),
        },
        {
            type: 'ESSAY',
            question: makeQuestion('ESSAY', {
                placeholder: 'Write your response here...',
                maxLength: 2000,
            }),
            expectedText: 'Sample question?',
            expectedControl: (renderer: ReactTestRenderer) => (
                findHost(renderer, 'TextInput', (node) => node.props.multiline === true)
            ),
        },
        {
            type: 'IDENTIFICATION',
            question: makeQuestion('IDENTIFICATION', {
                placeholder: 'Enter your answer here...',
                maxLength: 250,
            }),
            expectedText: 'Sample question?',
            expectedControl: (renderer: ReactTestRenderer) => (
                findHost(renderer, 'TextInput', (node) => node.props.multiline !== true)
            ),
        },
    ])('renders $type prompt, header, and input family through nested JSX', ({ question, expectedText, expectedControl }) => {
        const renderer = renderQuestionCard({ question, totalQuestions: 8 });

        expect(hasText(renderer, 'Question 1 of 8')).toBe(true);
        expect(hasText(renderer, expectedText)).toBe(true);
        expect(hasText(renderer, question.text || 'Question prompt unavailable.')).toBe(true);
        expect(expectedControl(renderer)).not.toBeNull();
    });

    it('renders default fallback prompt text when question.text is empty', () => {
        const renderer = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', {
                text: '',
                options: [{ id: 'A', text: 'Alpha' }],
            }),
        });

        expect(hasText(renderer, 'Question prompt unavailable.')).toBe(true);
    });

    it('keeps scroll content expanded with footer-safe bottom space', () => {
        const renderer = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', {
                options: [{ id: 'A', text: 'Alpha' }],
            }),
        });
        const scrollView = findHost(renderer, 'ScrollView');

        expect(scrollView?.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ flex: 1 }),
            ]),
        );
        expect(scrollView?.props.contentContainerStyle).toEqual(
            expect.objectContaining({
                flexGrow: 1,
                paddingBottom: 140,
            }),
        );
    });

    it('renders PassageCard content when question has a passage', () => {
        const renderer = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', {
                passage: '<p>Once upon a time...</p>',
                passageTitle: 'Story',
                options: [{ id: 'A', text: 'Option' }],
            }),
        });

        expect(hasText(renderer, 'Story')).toBe(true);
        expect(hasText(renderer, 'Once upon a time...')).toBe(true);
    });

    it('does not render passage content when question has no passage', () => {
        const renderer = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', {
                passage: null,
                options: [{ id: 'A', text: 'Option' }],
            }),
        });

        expect(hasText(renderer, 'Reading Passage')).toBe(false);
    });

    it('calls onSelectOption with option id when a multiple-choice item is pressed', () => {
        const onSelectOption = vi.fn();
        const renderer = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', {
                options: [{ id: 'A', text: 'Alpha' }],
            }),
            onSelectOption,
        });
        const optionButton = findHost(
            renderer,
            'TouchableOpacity',
            (node) => node.props.accessibilityLabel === 'Alpha',
        );

        act(() => {
            optionButton?.props.onPress();
        });

        expect(onSelectOption).toHaveBeenCalledWith('A');
    });

    it('marks a multiple-choice option as selected by id or text', () => {
        const question = makeQuestion('MULTIPLE_CHOICE', {
            options: [
                { id: 'A', text: 'Alpha' },
                { id: 'B', text: 'Beta' },
            ],
        });
        const byId = renderQuestionCard({ question, selectedOptionId: 'A' });
        const byText = renderQuestionCard({ question, selectedOptionId: 'Alpha' });

        expect(
            findHost(
                byId,
                'TouchableOpacity',
                (node) =>
                    node.props.accessibilityLabel === 'Alpha' &&
                    node.props.accessibilityState?.checked === true,
            ),
        ).not.toBeNull();
        expect(
            findHost(
                byText,
                'TouchableOpacity',
                (node) =>
                    node.props.accessibilityLabel === 'Alpha' &&
                    node.props.accessibilityState?.checked === true,
            ),
        ).not.toBeNull();
    });

    it('toggles multi-response values by id and text', () => {
        const onSelectOption = vi.fn();
        const renderer = renderQuestionCard({
            question: makeQuestion('MULTIPLE_RESPONSE', {
                options: [
                    { id: 'A', text: 'One' },
                    { id: 'B', text: 'Two' },
                ],
            }),
            selectedOptionId: ['One'],
            onSelectOption,
        });
        const selected = findHost(
            renderer,
            'TouchableOpacity',
            (node) => node.props.accessibilityLabel === 'One',
        );
        const unselected = findHost(
            renderer,
            'TouchableOpacity',
            (node) => node.props.accessibilityLabel === 'Two',
        );

        act(() => {
            selected?.props.onPress();
            unselected?.props.onPress();
        });

        expect(onSelectOption).toHaveBeenNthCalledWith(1, []);
        expect(onSelectOption).toHaveBeenNthCalledWith(2, ['One', 'B']);
    });

    it('supports boolean true and false in selectedOptionId for true/false questions', () => {
        const question = makeQuestion('TRUE_FALSE', {
            options: [
                { id: 'true', text: 'True' },
                { id: 'false', text: 'False' },
            ],
        });
        const trueRenderer = renderQuestionCard({ question, selectedOptionId: true });
        const falseRenderer = renderQuestionCard({ question, selectedOptionId: false });

        expect(
            findHost(
                trueRenderer,
                'TouchableOpacity',
                (node) =>
                    node.props.accessibilityLabel === 'True' &&
                    node.props.accessibilityState?.checked === true,
            ),
        ).not.toBeNull();
        expect(
            findHost(
                falseRenderer,
                'TouchableOpacity',
                (node) =>
                    node.props.accessibilityLabel === 'False' &&
                    node.props.accessibilityState?.checked === true,
            ),
        ).not.toBeNull();
    });

    it('calls onToggleFlag when the flag button is pressed', () => {
        const onToggleFlag = vi.fn();
        const renderer = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', {
                options: [{ id: 'A', text: 'Option' }],
            }),
            onToggleFlag,
        });
        const flagButton = findHost(
            renderer,
            'TouchableOpacity',
            (node) => node.props.accessibilityLabel === 'Flag question for review',
        );

        act(() => {
            flagButton?.props.onPress();
        });

        expect(onToggleFlag).toHaveBeenCalledOnce();
    });

    it('updates matching answers without replacing other matched pairs', () => {
        const onSelectOption = vi.fn();
        const renderer = renderQuestionCard({
            question: makeQuestion('MATCHING', {
                pairs: [
                    { left: 'Left Item 1', right: 'Right Item 1' },
                    { left: 'Left Item 2', right: 'Right Item 2' },
                ],
            }),
            selectedOptionId: { 'Left Item 1': 'Matched Val' },
            onSelectOption,
        });
        const input = findHost(
            renderer,
            'TextInput',
            (node) => node.props.accessibilityLabel === 'Match for Left Item 1',
        );

        expect(input?.props.defaultValue).toBe('Matched Val');
        act(() => {
            input?.props.onChangeText('Updated Val');
        });

        expect(onSelectOption).toHaveBeenCalledWith({
            'Left Item 1': 'Updated Val',
        });
    });

    it('updates a multiple blank answer by index', () => {
        const onSelectOption = vi.fn();
        const renderer = renderQuestionCard({
            question: makeQuestion('FILL_BLANK', {
                blanks: ['Blank 1', 'Blank 2'],
            }),
            selectedOptionId: ['Value 1', 'Value 2'],
            onSelectOption,
        });
        const input = findHost(
            renderer,
            'TextInput',
            (node) => node.props.accessibilityLabel === 'Blank 2',
        );

        act(() => {
            input?.props.onChangeText('New Val');
        });

        expect(onSelectOption).toHaveBeenCalledWith(['Value 1', 'New Val']);
    });

    it('renders fallback TextInput for multiple-choice when options array is empty', () => {
        const renderer = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', {
                options: [],
            }),
            selectedOptionId: 'Typed answer',
        });
        const input = findHost(renderer, 'TextInput');

        expect(input?.props.defaultValue).toBe('Typed answer');
    });

    it('renders fallback TextInput for unmapped question types', () => {
        const renderer = renderQuestionCard({
            question: makeQuestion('CUSTOM_TYPE' as unknown as QuestionType, {
                placeholder: 'Custom type placeholder',
            }),
        });

        expect(findHost(renderer, 'TextInput')).not.toBeNull();
    });

    it('renders point indicator with singular and plural labels', () => {
        const singular = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', { points: 1 }),
            totalQuestions: 5,
        });
        const plural = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', { points: 5 }),
            currentIndex: 1,
            totalQuestions: 5,
        });

        expect(hasText(singular, '1 pt')).toBe(true);
        expect(hasText(plural, '5 pts')).toBe(true);
    });

    it('renders option letter pills for choice and response questions', () => {
        const choice = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', {
                options: [
                    { id: 'opt-1', text: 'First choice' },
                    { id: 'opt-2', text: 'Second choice' },
                ],
            }),
        });
        const response = renderQuestionCard({
            question: makeQuestion('MULTIPLE_RESPONSE', {
                options: [
                    { id: 'opt-1', text: 'Option One' },
                    { id: 'opt-2', text: 'Option Two' },
                ],
            }),
        });

        expect(hasText(choice, 'A.')).toBe(true);
        expect(hasText(choice, 'B.')).toBe(true);
        expect(hasText(response, 'A.')).toBe(true);
        expect(hasText(response, 'B.')).toBe(true);
    });

    it('renders enumeration fallback items and appends changed values', () => {
        const onSelectOption = vi.fn();
        const renderer = renderQuestionCard({
            question: makeQuestion('ENUMERATION', {
                blanks: [],
            }),
            selectedOptionId: ['Alpha', 'Beta'],
            onSelectOption,
        });
        const input = findHost(
            renderer,
            'TextInput',
            (node) => node.props.accessibilityLabel === 'Item 3',
        );

        expect(findAllHosts(renderer, 'TextInput')).toHaveLength(3);
        expect(hasText(renderer, 'Item 3')).toBe(true);
        act(() => {
            input?.props.onChangeText('Gamma');
        });

        expect(onSelectOption).toHaveBeenCalledWith(['Alpha', 'Beta', 'Gamma']);
    });

    it('reports mount and layout status to the diagnostic callback', () => {
        const onRenderStatusChange = vi.fn();
        const renderer = renderQuestionCard({
            question: makeQuestion('MULTIPLE_CHOICE', {
                options: [{ id: 'A', text: 'Alpha' }],
            }),
            onRenderStatusChange,
        });
        const scrollView = findHost(renderer, 'ScrollView');

        expect(onRenderStatusChange).toHaveBeenCalledWith({ kind: 'mounted' });

        act(() => {
            scrollView?.props.onLayout({
                nativeEvent: {
                    layout: {
                        width: 320.4,
                        height: 480.6,
                    },
                },
            });
        });

        expect(onRenderStatusChange).toHaveBeenCalledWith({
            kind: 'layout',
            layout: {
                width: 320,
                height: 481,
            },
        });
    });
});
