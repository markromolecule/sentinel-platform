import { Colors } from '@/constants/theme';
import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    heroContainer: {
        height: height * 0.5,
        backgroundColor: Colors.light.primary,
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'visible',
    },
    imageWrapper: {
        width: width * 0.8,
        height: height * 0.4,
        marginBottom: -height * 0.1,
    },
    characterImage: {
        width: '100%',
        height: '100%',
    },
    cardContainer: {
        flex: 1,
        marginTop: -32,
        zIndex: 2,
    },
    card: {
        flex: 1,
        backgroundColor: Colors.light.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 32,
        paddingBottom: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    textSection: {
        marginBottom: 24,
    },
    title: {
        fontSize: width < 380 ? 26 : 30,
        fontWeight: '800',
        color: Colors.light.text,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: width < 380 ? 14 : 16,
        color: Colors.light.text,
        opacity: 0.6,
        lineHeight: width < 380 ? 20 : 24,
    },
    featureContainer: {
        marginBottom: height < 700 ? 24 : 32,
        gap: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.light.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        fontSize: 15,
        color: Colors.light.text,
        fontWeight: '600',
        opacity: 0.8,
    },
    button: {
        backgroundColor: Colors.light.primary,
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
        marginTop: 'auto', // Push to bottom of card
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    buttonIcon: {
        marginLeft: 8,
    },
});
