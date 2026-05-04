import { Colors } from '@/constants/theme';
import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: height < 700 ? 12 : 20,
        backgroundColor: Colors.light.background,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.light.input,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTitle: {
        fontSize: width < 380 ? 20 : 24,
        fontWeight: '800',
        color: Colors.light.text,
        letterSpacing: -0.5,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginTop: height < 700 ? 16 : 24,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: width < 380 ? 14 : 15,
        color: Colors.light.text,
        lineHeight: width < 380 ? 20 : 24,
        opacity: 0.7,
        marginBottom: 16,
    },
    spacing: {
        height: 40,
    },
    footer: {
        padding: 24,
        paddingBottom: height < 700 ? 24 : 40,
        backgroundColor: Colors.light.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height < 700 ? 16 : 24,
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    checkboxChecked: {
        backgroundColor: Colors.light.primary,
    },
    checkboxText: {
        fontSize: 14,
        color: Colors.light.text,
        flex: 1,
        lineHeight: 20,
        opacity: 0.9,
    },
    button: {
        backgroundColor: Colors.light.primary,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonDisabled: {
        backgroundColor: Colors.light.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
