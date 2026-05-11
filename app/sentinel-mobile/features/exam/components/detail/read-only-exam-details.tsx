import { ScrollView, StatusBar, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { AboutSection } from './about-section';
import { HeroHeader } from './hero-header';
import { InstructionsList } from './instructions-list';
import { QuickInfoBar } from './quick-info-bar';
import { BottomCTA } from './bottom-cta';
import type { MobileExamDisplay } from '@/features/exam/lib/mobile-exam-adapter';
import type { ThemeColors } from '@/types/exam';

type ReadOnlyExamDetailsProps = {
    exam: MobileExamDisplay;
    colors: ThemeColors;
    isDark: boolean;
    insetTop: number;
    onBack: () => void;
};

function formatDate(value?: string | null) {
    if (!value) {
        return 'Not recorded';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Not recorded';
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatStatus(status: MobileExamDisplay['status']) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPrimaryDate(exam: MobileExamDisplay) {
    if (exam.status === 'turned_in' || exam.status === 'completed') {
        return {
            label: 'Turned In',
            value: formatDate(exam.completedAt ?? exam.endDateTime ?? null),
        };
    }

    if (exam.status === 'past_due') {
        return {
            label: 'Due',
            value: formatDate(exam.endDateTime ?? null),
        };
    }

    return {
        label: 'Scheduled',
        value: formatDate(exam.scheduledDate ?? null),
    };
}

function formatScore(exam: MobileExamDisplay) {
    if (typeof exam.score !== 'number') {
        return 'Pending';
    }

    if (typeof exam.totalScore === 'number') {
        return `${exam.score} / ${exam.totalScore}`;
    }

    return String(exam.score);
}

function getStatusColors(status: MobileExamDisplay['status'], colors: ThemeColors) {
    switch (status) {
        case 'past_due':
            return { text: '#dc2626', background: '#fee2e2' };
        case 'turned_in':
        case 'completed':
            return { text: '#059669', background: '#d1fae5' };
        default:
            return { text: colors.primary, background: `${colors.primary}14` };
    }
}

function DetailSection({ children, colors }: { children: ReactNode; colors: ThemeColors }) {
    return (
        <View
            style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
                marginBottom: 48,
                borderRadius: 20,
                borderWidth: 1,
                overflow: 'hidden',
            }}
        >
            {children}
        </View>
    );
}

function DetailDivider({ colors }: { colors: ThemeColors }) {
    return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

function DetailRow({
    icon,
    label,
    value,
    colors,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    colors: ThemeColors;
}) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 24,
            }}
        >
            <View
                style={{
                    marginRight: 12,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    backgroundColor: `${colors.primary}12`,
                }}
            >
                <Ionicons name={icon} size={17} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: colors.icon,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                    }}
                >
                    {label}
                </Text>
                <Text
                    style={{
                        marginTop: 4,
                        fontSize: 14,
                        fontWeight: '700',
                        color: colors.text,
                    }}
                    numberOfLines={2}
                >
                    {value}
                </Text>
            </View>
        </View>
    );
}

function StatusRow({
    status,
    statusColors,
    colors,
}: {
    status: MobileExamDisplay['status'];
    statusColors: ReturnType<typeof getStatusColors>;
    colors: ThemeColors;
}) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingTop: 32,
                paddingBottom: 20,
            }}
        >
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: colors.icon,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                    }}
                >
                    Status
                </Text>
            </View>
            <View
                style={{
                    marginLeft: 12,
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    backgroundColor: statusColors.background,
                }}
            >
                <Text
                    style={{
                        fontSize: 10,
                        fontWeight: '800',
                        color: statusColors.text,
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                    }}
                >
                    {formatStatus(status)}
                </Text>
            </View>
        </View>
    );
}

function MetricItem({
    icon,
    label,
    value,
    colors,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    colors: ThemeColors;
}) {
    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 24,
            }}
        >
            <View
                style={{
                    marginRight: 12,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    backgroundColor: `${colors.primary}12`,
                }}
            >
                <Ionicons name={icon} size={17} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: colors.icon,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                    }}
                >
                    {label}
                </Text>
                <Text
                    style={{
                        marginTop: 4,
                        fontSize: 14,
                        fontWeight: '800',
                        color: colors.text,
                    }}
                    numberOfLines={1}
                >
                    {value}
                </Text>
            </View>
        </View>
    );
}

function MetricRow({
    score,
    percentage,
    colors,
}: {
    score: string;
    percentage: string;
    colors: ThemeColors;
}) {
    return (
        <View className="flex-row">
            <MetricItem icon="trophy-outline" label="Score" value={score} colors={colors} />
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <MetricItem
                icon="analytics-outline"
                label="Result"
                value={percentage}
                colors={colors}
            />
        </View>
    );
}

function SectionTitle({ children, colors }: { children: string; colors: ThemeColors }) {
    return (
        <Text
            className="font-bold uppercase"
            style={{ color: colors.icon, letterSpacing: 1.6, fontSize: 11, marginBottom: 20 }}
        >
            {children}
        </Text>
    );
}

export function ReadOnlyExamDetails({
    exam,
    colors,
    isDark,
    insetTop,
    onBack,
}: ReadOnlyExamDetailsProps) {
    const primaryDate = getPrimaryDate(exam);
    const percentage =
        typeof exam.percentage === 'number' ? `${Math.round(exam.percentage)}%` : 'Pending';
    const statusColors = getStatusColors(exam.status, colors);
    const securityValue = exam.cheated
        ? (exam.cheatingType ?? 'Flagged')
        : `${exam.incidentCount ?? 0} incidents`;

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                contentContainerStyle={{ paddingBottom: 110 }}
            >
                <HeroHeader
                    exam={exam}
                    isDark={isDark}
                    colors={colors}
                    insetTop={insetTop}
                    onBack={onBack}
                />

                <QuickInfoBar
                    duration={exam.duration}
                    questions={exam.questions}
                    passingPercentage={exam.passingPercentage}
                    colors={colors}
                />

                <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
                    <SectionTitle colors={colors}>Summary</SectionTitle>

                    <DetailSection colors={colors}>
                        <StatusRow
                            status={exam.status}
                            statusColors={statusColors}
                            colors={colors}
                        />
                        <DetailDivider colors={colors} />
                        <DetailRow
                            icon="calendar-outline"
                            label={primaryDate.label}
                            value={primaryDate.value}
                            colors={colors}
                        />
                        <DetailDivider colors={colors} />
                        <MetricRow
                            score={formatScore(exam)}
                            percentage={percentage}
                            colors={colors}
                        />
                        <DetailDivider colors={colors} />
                        <DetailRow
                            icon="shield-checkmark-outline"
                            label="Security"
                            value={securityValue}
                            colors={colors}
                        />
                    </DetailSection>

                    <AboutSection description={exam.description} isDark={isDark} colors={colors} />

                    <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 28 }} />

                    <InstructionsList
                        instructions={exam.instructions}
                        isDark={isDark}
                        colors={colors}
                    />
                </View>
            </ScrollView>

            <BottomCTA colors={colors} onPress={onBack} label="Done" />
        </View>
    );
}
