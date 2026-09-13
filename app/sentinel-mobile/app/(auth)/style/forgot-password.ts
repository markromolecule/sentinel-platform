import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const HEADER_HEIGHT = 220;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    form: {
        gap: 16,
        backgroundColor: '#fff',
        paddingTop: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.light.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.icon,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 4,
        marginBottom: 8,
    },
    confirmationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        gap: 16,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    confirmationTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
        textAlign: 'center',
    },
    confirmationMessage: {
        fontSize: 14,
        color: Colors.light.icon,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 12,
    },
    emailHighlight: {
        fontWeight: '600',
        color: Colors.light.text,
    },
    instructionsCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        padding: 16,
        width: '100%',
        gap: 8,
        marginTop: 8,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    instructionText: {
        fontSize: 13,
        color: Colors.light.text,
        flex: 1,
        lineHeight: 18,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        paddingVertical: 10,
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.primary,
    },
});

export default styles;
