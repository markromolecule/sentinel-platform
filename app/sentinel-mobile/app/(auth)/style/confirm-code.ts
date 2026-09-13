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
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    headerSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 16,
        paddingBottom: 8,
        gap: 10,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
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
        lineHeight: 22,
        paddingHorizontal: 12,
    },
    emailHighlight: {
        fontWeight: '700',
        color: Colors.light.text,
    },
    form: {
        gap: 16,
        marginTop: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.icon,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    successAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    successText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#065F46',
        flex: 1,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingHorizontal: 2,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    linkText: {
        fontSize: 13,
        color: Colors.light.icon,
    },
    resendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    resendText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.light.primary,
    },
    resendDisabledText: {
        color: '#9CA3AF',
    },
    footer: {
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: Colors.light.icon,
        textAlign: 'center',
        lineHeight: 18,
    },
    supportLink: {
        color: Colors.light.primary,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 16,
    },
});

export default styles;
