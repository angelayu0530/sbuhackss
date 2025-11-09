import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import dayjs from 'dayjs';
import socket from '../services/socket';
import api from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Color theme matching frontend
const COLORS = {
    primary: '#5cc9b1',
    primaryDark: '#4bb8a2',
    secondary: '#b7a9e1',
    background: '#f8f9fa',
    cardBg: '#ffffff',
    textDark: '#333333',
    textMedium: '#666666',
    textLight: '#999999',
    border: '#e5e5e5',
};

interface ScheduleEvent {
    id: number;
    start_time: string;
    end_time: string;
    location?: string;
}

export default function ScheduleScreen() {
    const [events, setEvents] = useState<ScheduleEvent[]>([]);

    useEffect(() => {
        loadSchedule();

        socket.on('schedule_updated', () => {
            loadSchedule();
        });

        return () => {
            socket.off('schedule_updated');
        };
    }, []);

    const loadSchedule = async () => {
        try {
            const data = await api.getSchedule();
            setEvents(data);
        } catch (error) {
            console.error('Failed to load schedule:', error);
        }
    };

    const getCurrentTime = () => {
        return dayjs().format('h:mm A');
    };

    const speak = (text: string) => {
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.75,
        });
    };

    const speakAllEvents = () => {
        if (events.length === 0) {
            speak('Today\'s Schedule. No events scheduled. Enjoy your free time!');
        } else {
            const eventText = events.map(event =>
                `${dayjs(event.start_time).format('h:mm A')} to ${dayjs(event.end_time).format('h:mm A')}, ${event.location || 'Event'}`
            ).join('. ');
            speak(`Today's Schedule. ${eventText}`);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <TouchableOpacity
                style={styles.header}
                onPress={speakAllEvents}
                activeOpacity={0.8}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Today's Schedule</Text>
                    <Text style={styles.speakerIcon}>🔊</Text>
                </View>
                <Text style={styles.currentTime}>{getCurrentTime()}</Text>
            </TouchableOpacity>

            {events.length === 0 ? (
                <TouchableOpacity
                    style={styles.emptyState}
                    onPress={() => speak('No events scheduled. Enjoy your free time!')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.emptyText}>No events scheduled</Text>
                    <Text style={styles.emptySubtext}>Enjoy your free time! 🔊</Text>
                </TouchableOpacity>
            ) : (
                events.map((event, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.eventCard}
                        onPress={() => speak(`${dayjs(event.start_time).format('h:mm A')} to ${dayjs(event.end_time).format('h:mm A')}, ${event.location || 'Event'}`)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.timeContainer}>
                            <Text style={styles.eventTime}>
                                {dayjs(event.start_time).format('h:mm A')}
                            </Text>
                        </View>
                        <View style={styles.eventDetails}>
                            <Text style={styles.eventTitle}>{event.location || 'Event'}</Text>
                            <Text style={styles.eventDescription}>
                                {dayjs(event.start_time).format('h:mm A')} - {dayjs(event.end_time).format('h:mm A')}
                            </Text>
                        </View>
                        <Text style={styles.cardSpeakerIcon}>🔊</Text>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contentContainer: {
        padding: SCREEN_WIDTH * 0.05,
        paddingBottom: SCREEN_HEIGHT * 0.05,
    },
    header: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: SCREEN_WIDTH * 0.05,
        marginBottom: SCREEN_HEIGHT * 0.03,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SCREEN_HEIGHT * 0.01,
    },
    title: {
        fontSize: Math.min(SCREEN_WIDTH * 0.075, 34),
        fontWeight: '700',
        color: COLORS.textDark,
        flex: 1,
    },
    speakerIcon: {
        fontSize: Math.min(SCREEN_WIDTH * 0.06, 26),
        marginLeft: SCREEN_WIDTH * 0.02,
    },
    currentTime: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        fontWeight: '700',
        color: COLORS.primary,
    },
    eventCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: SCREEN_WIDTH * 0.05,
        marginBottom: SCREEN_HEIGHT * 0.02,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    timeContainer: {
        marginRight: SCREEN_WIDTH * 0.04,
        minWidth: SCREEN_WIDTH * 0.22,
    },
    eventTime: {
        fontSize: Math.min(SCREEN_WIDTH * 0.05, 22),
        fontWeight: '700',
        color: COLORS.primary,
    },
    eventDetails: {
        flex: 1,
    },
    eventTitle: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        fontWeight: '700',
        color: COLORS.textDark,
        marginBottom: SCREEN_HEIGHT * 0.008,
    },
    eventDescription: {
        fontSize: Math.min(SCREEN_WIDTH * 0.045, 20),
        color: COLORS.textMedium,
        lineHeight: Math.min(SCREEN_WIDTH * 0.06, 26),
    },
    cardSpeakerIcon: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        marginLeft: SCREEN_WIDTH * 0.03,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: SCREEN_WIDTH * 0.08,
        marginTop: SCREEN_HEIGHT * 0.05,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyText: {
        fontSize: Math.min(SCREEN_WIDTH * 0.06, 26),
        fontWeight: '700',
        color: COLORS.textMedium,
        marginBottom: SCREEN_HEIGHT * 0.015,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: Math.min(SCREEN_WIDTH * 0.05, 22),
        color: COLORS.textLight,
        textAlign: 'center',
    },
});
