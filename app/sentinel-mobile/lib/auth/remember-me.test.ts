import { describe, it, expect, vi, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getRememberedEmail,
    setRememberedEmail,
    clearRememberedEmail,
} from './remember-me';
import { REMEMBERED_EMAIL_KEYS } from '@sentinel/shared/constants';

vi.mock('@react-native-async-storage/async-storage', () => ({
    default: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
    },
}));

describe('remember-me storage helper', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('retrieves remembered email from AsyncStorage', async () => {
        vi.mocked(AsyncStorage.getItem).mockResolvedValue('test@example.com');

        const email = await getRememberedEmail();
        expect(AsyncStorage.getItem).toHaveBeenCalledWith(REMEMBERED_EMAIL_KEYS.MOBILE);
        expect(email).toBe('test@example.com');
    });

    it('returns null if AsyncStorage fails on read', async () => {
        vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error('Storage failure'));

        const email = await getRememberedEmail();
        expect(email).toBeNull();
    });

    it('saves email to AsyncStorage with REMEMBERED_EMAIL_KEYS.MOBILE', async () => {
        vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);

        await setRememberedEmail('student@example.com');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            REMEMBERED_EMAIL_KEYS.MOBILE,
            'student@example.com',
        );
    });

    it('removes remembered email from AsyncStorage', async () => {
        vi.mocked(AsyncStorage.removeItem).mockResolvedValue(undefined);

        await clearRememberedEmail();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(REMEMBERED_EMAIL_KEYS.MOBILE);
    });
});
