import { Typography } from '@/constants/theme';
import { StyleSheet } from 'react-native';

const AVATAR_SIZE = 90;
const SENTINEL_BLUE = '#323d8f';

export default StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1 },
    header: {
        backgroundColor: SENTINEL_BLUE,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingBottom: 20,
    },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    navBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navBtnInner: {
        width: 34,
        height: 34,
        borderRadius: 17, // Half of width/height for a perfect circle
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navTitle: {
        color: '#fff',
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        letterSpacing: -0.5,
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: 6,
    },
    avatarWrapper: {
        marginBottom: 12,
    },
    avatarRing: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: 45,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarInitials: {
        fontSize: 28,
        fontWeight: Typography.weight.bold,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    fullName: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: '#fff',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    badgeText: {
        color: '#fff',
        fontSize: Typography.size.xs,
        fontWeight: Typography.weight.semibold,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 4,
    },
    sectionTitleText: {
        fontSize: Typography.size.base, // Normal size
        fontWeight: Typography.weight.bold,
        letterSpacing: -0.3,
    },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardTitle: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    cardDesc: {
        fontSize: Typography.size.xs, // Smaller as requested
        lineHeight: 16,
        marginBottom: 20,
    },
    primaryBtn: {
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.bold,
    },
    footer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    versionText: {
        fontSize: Typography.size.xs,
        color: '#94A3B8',
        fontWeight: Typography.weight.medium,
    },
    footerDivider: {
        width: 24,
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 10,
    },
    copyrightText: {
        fontSize: 9,
        color: '#CBD5E1',
        fontWeight: Typography.weight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
