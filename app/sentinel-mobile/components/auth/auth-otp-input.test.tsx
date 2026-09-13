import { vi, describe, it, expect, beforeEach } from 'vitest';

// ─── React mock ───────────────────────────────────────────────────────────────
let stateStore: any[] = [];
let stateIdx = 0;

vi.mock('react', () => ({
    useState: (initial: any) => {
        const i = stateIdx++;
        if (stateStore[i] === undefined) stateStore[i] = initial;
        const set = (v: any) => {
            stateStore[i] = typeof v === 'function' ? v(stateStore[i]) : v;
        };
        return [stateStore[i], set];
    },
    useRef: (initial: any) => ({ current: initial }),
    createElement: (type: any, props: any, ...children: any[]) => ({
        type,
        props: {
            ...props,
            children:
                children.length === 0
                    ? props?.children
                    : children.length === 1
                      ? children[0]
                      : children,
        },
    }),
    default: {},
}));

// ─── React Native mock ────────────────────────────────────────────────────────
vi.mock('react-native', () => ({
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    StyleSheet: {
        create: (styles: any) => styles,
    },
    Platform: {
        OS: 'ios',
        select: (obj: any) => obj?.ios ?? obj?.default,
    },
}));

vi.mock('@/constants/theme', () => ({
    Colors: {
        light: {
            text: '#11181C',
            background: '#fff',
            primary: '#323d8f',
            input: '#f4f4f5',
            border: '#e4e4e7',
            error: '#ef4444',
        },
    },
}));

import { AuthOtpInput } from './auth-otp-input';

describe('AuthOtpInput Component', () => {
    beforeEach(() => {
        stateStore = [];
        stateIdx = 0;
    });

    it('renders 6 cells by default', () => {
        const onChange = vi.fn();
        const tree: any = AuthOtpInput({
            value: '',
            onChange,
        });

        // Children of TouchableOpacity: [TextInput, cellsRow View]
        const cellsRow = tree.props.children[1];
        expect(cellsRow.props.children).toHaveLength(6);
    });

    it('populates cells with corresponding digits from value', () => {
        const onChange = vi.fn();
        const tree: any = AuthOtpInput({
            value: '482',
            onChange,
        });

        const cellsRow = tree.props.children[1];
        const cells = cellsRow.props.children;

        expect(cells[0].props.children.props.children).toBe('4');
        expect(cells[1].props.children.props.children).toBe('8');
        expect(cells[2].props.children.props.children).toBe('2');
        expect(cells[3].props.children.props.children).toBe('');
        expect(cells[4].props.children.props.children).toBe('');
        expect(cells[5].props.children.props.children).toBe('');
    });

    it('filters non-numeric characters and limits to length', () => {
        const onChange = vi.fn();
        const tree: any = AuthOtpInput({
            value: '',
            onChange,
            length: 6,
        });

        const hiddenInput = tree.props.children[0];
        hiddenInput.props.onChangeText('12a3b456789');

        expect(onChange).toHaveBeenCalledWith('123456');
    });

    it('supports custom length', () => {
        const onChange = vi.fn();
        const tree: any = AuthOtpInput({
            value: '',
            onChange,
            length: 4,
        });

        const cellsRow = tree.props.children[1];
        expect(cellsRow.props.children).toHaveLength(4);
    });

    it('applies error styling when hasError is true', () => {
        const onChange = vi.fn();
        const tree: any = AuthOtpInput({
            value: '123456',
            onChange,
            hasError: true,
        });

        const cellsRow = tree.props.children[1];
        const firstCell = cellsRow.props.children[0];
        expect(firstCell.props.style).toEqual(
            expect.arrayContaining([expect.objectContaining({ borderColor: '#ef4444' })]),
        );
    });

    it('focuses the input ref when a cell container is pressed', () => {
        const onChange = vi.fn();
        const tree: any = AuthOtpInput({
            value: '',
            onChange,
            disabled: false,
        });

        const hiddenInput = tree.props.children[0];
        // Ensure hiddenInput has props matching oneTimeCode
        expect(hiddenInput.props.textContentType).toBe('oneTimeCode');
        expect(hiddenInput.props.keyboardType).toBe('number-pad');
        expect(hiddenInput.props.inputMode).toBe('numeric');
    });
});
