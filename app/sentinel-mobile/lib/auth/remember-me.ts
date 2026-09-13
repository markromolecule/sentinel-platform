import AsyncStorage from '@react-native-async-storage/async-storage';
import { REMEMBERED_EMAIL_KEYS } from '@sentinel/shared/constants';

export async function getRememberedEmail(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(REMEMBERED_EMAIL_KEYS.MOBILE);
    } catch (err) {
        console.warn('Failed to load remembered email:', err);
        return null;
    }
}

export async function setRememberedEmail(email: string): Promise<void> {
    try {
        await AsyncStorage.setItem(REMEMBERED_EMAIL_KEYS.MOBILE, email);
    } catch (err) {
        console.warn('Failed to persist remembered email:', err);
    }
}

export async function clearRememberedEmail(): Promise<void> {
    try {
        await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEYS.MOBILE);
    } catch (err) {
        console.warn('Failed to clear remembered email:', err);
    }
}
