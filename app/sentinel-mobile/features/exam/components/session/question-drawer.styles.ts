import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    drawerContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 20,
        overflow: 'hidden',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },
    content: {
        width: '100%',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        padding: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        borderRadius: 9999,
        padding: 8,
    },
    scrollWrapper: {
        height: 96,
        width: '100%',
        paddingVertical: 16,
        marginBottom: 16,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
        alignItems: 'center',
    },
    badge: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badgeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    badgeTextCurrent: {
        fontWeight: 'bold',
    },
    flagBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        borderRadius: 9999,
        borderWidth: 1,
        padding: 2,
    },
    legendContainer: {
        borderTopWidth: 1,
        padding: 16,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 16,
    },
    legendPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    legendPillMargin: {
        marginRight: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 9999,
    },
    legendDotCurrent: {
        borderWidth: 2,
    },
    legendDotAnswered: {
        backgroundColor: '#10b981',
    },
    legendText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
