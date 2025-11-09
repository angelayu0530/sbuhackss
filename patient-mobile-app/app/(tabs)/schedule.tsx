import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';
import socket from '@/services/socket';
import api from '@/services/api';

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

    return (
        <LinearGradient
            colors={['#7ac594ff', '#388a4aff', '#0d502fff']}
            style={styles.gradientContainer}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <LinearGradient
                    colors={['#1b5021ff', '#41772aff', '#0e73b6ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <Text style={styles.title}>Today's Schedule</Text>
                    <Text style={styles.currentTime}>{getCurrentTime()}</Text>
                </LinearGradient>

                {events.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No events scheduled</Text>
                        <Text style={styles.emptySubtext}>Enjoy your free time!</Text>
                    </View>
                ) : (
                    events.map((event, index) => (
                        <View key={index} style={styles.eventCard}>
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
                        </View>
                    ))
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        borderRadius: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
    },
    currentTime: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
    },
    eventCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    timeContainer: {
        marginRight: 16,
        minWidth: 80,
    },
    eventTime: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6fb8d5',
    },
    eventDetails: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    eventDescription: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#999',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#bbb',
    },
});
