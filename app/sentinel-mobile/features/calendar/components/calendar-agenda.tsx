import React from 'react';
import { View, Text, FlatList, ViewToken, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { CalendarEvent } from '@/data/calendar';
import { EventCard } from './event-card';
import { formatDateKey, isSameDay } from '@/features/calendar/hooks/use-calendar';

interface CalendarAgendaProps {
    agendaDays: Date[];
    events: Record<string, CalendarEvent[]>;
    onDeleteNote: (id: string, dateKey: string) => void;
    flatListRef: any;
    onViewableItemsChanged: any;
}

const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
};

const DayItem = ({
    date,
    events,
    onDeleteNote,
}: {
    date: Date;
    events: Record<string, CalendarEvent[]>;
    onDeleteNote: any;
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const dateKey = formatDateKey(date);
    const dayEvents = events[dateKey] || [];
    const isToday = isSameDay(date, new Date());
    const formatFullDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long' });
    const formatDayAndMonth = (date: Date) =>
        date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    return (
        <View className="mb-8 px-6">
            <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <Text
                        className="text-xl font-black tracking-tight"
                        style={{ color: colors.text }}
                    >
                        {formatFullDayName(date)}
                    </Text>
                    {isToday && (
                        <View
                            className="rounded-full px-2.5 py-0.5"
                            style={{ backgroundColor: colors.primary }}
                        >
                            <Text className="text-[10px] font-black uppercase tracking-widest text-white">
                                TODAY
                            </Text>
                        </View>
                    )}
                </View>

                <Text className="text-sm font-bold opacity-30" style={{ color: colors.text }}>
                    {formatDayAndMonth(date)}
                </Text>
            </View>

            {dayEvents.length > 0 ? (
                dayEvents.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onDelete={(id) => onDeleteNote(id, dateKey)}
                    />
                ))
            ) : (
                <View
                    className="items-center justify-center rounded-[24px] border border-dashed p-6"
                    style={{
                        borderColor: colors.border,
                        backgroundColor: 'transparent',
                        borderStyle: 'dashed',
                    }}
                >
                    <Text
                        style={{ color: colors.icon }}
                        className="text-xs font-semibold opacity-40"
                    >
                        No exam schedules for this day
                    </Text>
                </View>
            )}
        </View>
    );
};

export const CalendarAgenda = ({
    agendaDays,
    events,
    onDeleteNote,
    flatListRef,
    onViewableItemsChanged,
}: CalendarAgendaProps) => {
    const renderDayItem = ({ item: date }: { item: Date }) => {
        return <DayItem date={date} events={events} onDeleteNote={onDeleteNote} />;
    };

    return (
        <FlatList
            ref={flatListRef}
            data={agendaDays}
            keyExtractor={(item) => formatDateKey(item)}
            renderItem={renderDayItem}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        />
    );
};
