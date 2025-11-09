import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import socket from '../services/socket';
import api from '../services/api';
import dayjs from 'dayjs';

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
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>👤 Your Caregiver</Text>
                    <Text style={styles.cardText}>{homeData.caregiver_status}</Text>
                </View>
            )}

            {/* Today's Schedule */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📅 Today's Schedule</Text>
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
                    onPress={() => navigation.navigate('Schedule')}
                >
                    <Text style={styles.buttonText}>View Full Schedule</Text>
                </TouchableOpacity>
            </View>

            {/* Where Am I */}
            {homeData.home_address && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📍 Where Am I?</Text>
                    <Text style={styles.cardText}>Home - {homeData.home_address}</Text>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={() => navigation.navigate('Navigation')}
                    >
                        <Text style={styles.buttonText}>How to Get Home</Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#6fb8d5',
        padding: 30,
        alignItems: 'center',
    },
    time: {
        fontSize: 48,
        fontWeight: '800',
        color: 'white',
    },
    greeting: {
        fontSize: 32,
        fontWeight: '600',
        color: 'white',
        marginTop: 10,
    },
    date: {
        fontSize: 20,
        color: 'white',
        marginTop: 5,
    },
    card: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 15,
        color: '#333',
    },
    cardText: {
        fontSize: 20,
        color: '#666',
        lineHeight: 28,
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    scheduleTime: {
        fontSize: 22,
        fontWeight: '700',
        color: '#6fb8d5',
        width: 120,
    },
    scheduleLocation: {
        fontSize: 22,
        color: '#333',
        flex: 1,
    },
    button: {
        backgroundColor: '#6fb8d5',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 15,
    },
    buttonSecondary: {
        backgroundColor: '#ffa67f',
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        marginBottom: 30,
    },
    quickButton: {
        backgroundColor: 'white',
        width: 140,
        height: 140,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickButtonText: {
        fontSize: 48,
    },
    quickButtonLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 10,
    },
    loadingText: {
        fontSize: 24,
        color: '#666',
        textAlign: 'center',
        marginTop: 100,
    },
});