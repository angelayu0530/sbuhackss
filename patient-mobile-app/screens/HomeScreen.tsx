import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import socket from '../services/socket';
import api from '../services/api';
import dayjs from 'dayjs';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Color theme matching frontend
const COLORS = {
    primary: '#5cc9b1',      // Teal (main brand color)
    primaryDark: '#4bb8a2',  // Darker teal for hover
    secondary: '#b7a9e1',    // Purple accent
    background: '#f8f9fa',   // Light gray background
    cardBg: '#ffffff',       // White cards
    textDark: '#333333',     // Dark text
    textMedium: '#666666',   // Medium gray text
    textLight: '#999999',    // Light gray text
    border: '#e5e5e5',       // Border color
};

const PATIENT_ID = 1; // Replace with actual patient ID

export default function HomeScreen({ navigation }: any) {
    const [homeData, setHomeData] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        // Connect to Socket.IO
        socket.connect();

        // Set up real-time listeners
        socket.on('schedule_changed', () => {
            loadHomeData();
        });

        socket.on('urgent_message', (data: any) => {
            Alert.alert('Message from Caregiver', data.message, [{ text: 'OK' }]);
        });

        // Load initial data
        loadHomeData();

        // Update time every minute
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 60000);

        return () => {
            clearInterval(timer);
            socket.off('schedule_changed');
            socket.off('urgent_message');
        };
    }, []);

    const loadHomeData = async () => {
        try {
            const data = await api.getHomeData();
            setHomeData(data);
        } catch (error) {
            console.error('Error loading home data:', error);
        }
    };

    const getGreeting = () => {
        const hour = currentTime.hour();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const speak = (text: string) => {
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.75, // Slower for elderly
        });
    };

    if (!homeData) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.time}>{currentTime.format('h:mm A')}</Text>
                <Text style={styles.greeting}>{getGreeting()}!</Text>
                <Text style={styles.date}>{currentTime.format('dddd, MMMM D')}</Text>
            </View>

            {/* Caregiver Status */}
            {homeData.caregiver_status && (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => speak(`Your Caregiver. ${homeData.caregiver_status}`)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>👤 Your Caregiver</Text>
                        <Text style={styles.speakerIcon}>🔊</Text>
                    </View>
                    <Text style={styles.cardText}>{homeData.caregiver_status}</Text>
                </TouchableOpacity>
            )}

            {/* Today's Schedule */}
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    const scheduleText = homeData.schedule && homeData.schedule.length > 0
                        ? `Today's Schedule. ${homeData.schedule.map((item: any) =>
                            `${dayjs(item.start_time).format('h:mm A')} ${item.location || 'Event'}`
                        ).join('. ')}`
                        : 'Today\'s Schedule. No events scheduled today';
                    speak(scheduleText);
                }}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>📅 Today's Schedule</Text>
                    <Text style={styles.speakerIcon}>🔊</Text>
                </View>
                {homeData.schedule && homeData.schedule.length > 0 ? (
                    homeData.schedule.slice(0, 3).map((item: any, index: number) => (
                        <View key={index} style={styles.scheduleItem}>
                            <Text style={styles.scheduleTime}>
                                {dayjs(item.start_time).format('h:mm A')}
                            </Text>
                            <Text style={styles.scheduleLocation}>{item.location || 'Event'}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.cardText}>No events scheduled today</Text>
                )}
                <TouchableOpacity
                    style={styles.button}
                    onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('Schedule');
                    }}
                >
                    <Text style={styles.buttonText}>View Full Schedule</Text>
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Where Am I */}
            {homeData.home_address && (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => speak(`Where Am I? You are at Home. ${homeData.home_address}`)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>📍 Where Am I?</Text>
                        <Text style={styles.speakerIcon}>🔊</Text>
                    </View>
                    <Text style={styles.cardText}>Home - {homeData.home_address}</Text>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={(e) => {
                            e.stopPropagation();
                            navigation.navigate('Navigation');
                        }}
                    >
                        <Text style={styles.buttonText}>How to Get Home</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => navigation.navigate('FAQ')}
                >
                    <Text style={styles.quickButtonText}>❓</Text>
                    <Text style={styles.quickButtonLabel}>Help</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => navigation.navigate('Contacts')}
                >
                    <Text style={styles.quickButtonText}>☎️</Text>
                    <Text style={styles.quickButtonLabel}>Call</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingVertical: SCREEN_HEIGHT * 0.05,
        paddingHorizontal: SCREEN_WIDTH * 0.05,
        alignItems: 'center',
    },
    time: {
        fontSize: Math.min(SCREEN_WIDTH * 0.15, 64),
        fontWeight: '800',
        color: 'white',
    },
    greeting: {
        fontSize: Math.min(SCREEN_WIDTH * 0.09, 40),
        fontWeight: '600',
        color: 'white',
        marginTop: SCREEN_HEIGHT * 0.015,
    },
    date: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        color: 'white',
        marginTop: SCREEN_HEIGHT * 0.008,
    },
    card: {
        backgroundColor: COLORS.cardBg,
        marginHorizontal: SCREEN_WIDTH * 0.04,
        marginVertical: SCREEN_HEIGHT * 0.015,
        padding: SCREEN_WIDTH * 0.06,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SCREEN_HEIGHT * 0.015,
    },
    cardTitle: {
        fontSize: Math.min(SCREEN_WIDTH * 0.065, 28),
        fontWeight: '700',
        color: COLORS.textDark,
        flex: 1,
    },
    speakerIcon: {
        fontSize: Math.min(SCREEN_WIDTH * 0.06, 26),
        marginLeft: SCREEN_WIDTH * 0.03,
    },
    cardText: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        color: COLORS.textMedium,
        lineHeight: Math.min(SCREEN_WIDTH * 0.075, 32),
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SCREEN_HEIGHT * 0.018,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    scheduleTime: {
        fontSize: Math.min(SCREEN_WIDTH * 0.06, 26),
        fontWeight: '700',
        color: COLORS.primary,
        width: SCREEN_WIDTH * 0.3,
    },
    scheduleLocation: {
        fontSize: Math.min(SCREEN_WIDTH * 0.06, 26),
        color: COLORS.textDark,
        flex: 1,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SCREEN_HEIGHT * 0.022,
        paddingHorizontal: SCREEN_WIDTH * 0.05,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: SCREEN_HEIGHT * 0.02,
    },
    buttonSecondary: {
        backgroundColor: COLORS.secondary,
    },
    buttonText: {
        color: 'white',
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        fontWeight: '700',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: SCREEN_WIDTH * 0.04,
        paddingVertical: SCREEN_HEIGHT * 0.02,
        marginBottom: SCREEN_HEIGHT * 0.03,
    },
    quickButton: {
        backgroundColor: COLORS.cardBg,
        width: SCREEN_WIDTH * 0.4,
        height: SCREEN_WIDTH * 0.4,
        maxWidth: 170,
        maxHeight: 170,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickButtonText: {
        fontSize: Math.min(SCREEN_WIDTH * 0.14, 60),
    },
    quickButtonLabel: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        fontWeight: '700',
        color: COLORS.textDark,
        marginTop: SCREEN_HEIGHT * 0.012,
    },
    loadingText: {
        fontSize: Math.min(SCREEN_WIDTH * 0.07, 30),
        color: COLORS.textMedium,
        textAlign: 'center',
        marginTop: SCREEN_HEIGHT * 0.15,
    },
});