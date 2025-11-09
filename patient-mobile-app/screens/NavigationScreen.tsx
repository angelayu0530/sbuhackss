import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
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

interface Landmark {
    id: number;
    step_number: number;
    title: string;
    description?: string;
    photo_url?: string;
}

export default function NavigationScreen() {
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);

    useEffect(() => {
        loadLandmarks();

        socket.on('landmarks_updated', () => {
            loadLandmarks();
        });

        return () => {
            socket.off('landmarks_updated');
        };
    }, []);

    const loadLandmarks = async () => {
        try {
            const data = await api.getLandmarks();
            setLandmarks(data.sort((a, b) => a.step_number - b.step_number));
        } catch (error) {
            console.error('Failed to load landmarks:', error);
        }
    };

    const speak = (text: string) => {
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.75,
        });
    };

    const speakAllSteps = () => {
        if (landmarks.length === 0) {
            speak('No navigation steps available. Contact your caregiver for directions.');
        } else {
            const stepsText = landmarks.map(landmark =>
                `Step ${landmark.step_number}. ${landmark.title}. ${landmark.description || ''}`
            ).join('. ');
            speak(`Follow these steps to get home safely. ${stepsText}`);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <TouchableOpacity
                style={styles.introCard}
                onPress={speakAllSteps}
                activeOpacity={0.7}
            >
                <Text style={styles.subtitle}>Follow these steps to get home safely 🔊</Text>
                <Text style={styles.subtitleHint}>Tap to hear all steps</Text>
            </TouchableOpacity>

            {landmarks.length === 0 ? (
                <TouchableOpacity
                    style={styles.emptyState}
                    onPress={() => speak('No navigation steps available. Contact your caregiver for directions.')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.emptyText}>No navigation steps available</Text>
                    <Text style={styles.emptySubtext}>Contact your caregiver for directions 🔊</Text>
                </TouchableOpacity>
            ) : (
                landmarks.map((landmark) => (
                    <TouchableOpacity
                        key={landmark.id}
                        style={styles.stepCard}
                        onPress={() => speak(`Step ${landmark.step_number}. ${landmark.title}. ${landmark.description || ''}`)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{landmark.step_number}</Text>
                            </View>
                            <Text style={styles.stepTitle}>{landmark.title}</Text>
                            <Text style={styles.stepSpeaker}>🔊</Text>
                        </View>

                        {landmark.photo_url && (
                            <Image source={{ uri: landmark.photo_url }} style={styles.photo} />
                        )}

                        <Text style={styles.description}>{landmark.description}</Text>
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
    introCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: SCREEN_WIDTH * 0.06,
        marginBottom: SCREEN_HEIGHT * 0.03,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    subtitle: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        color: COLORS.textDark,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: SCREEN_HEIGHT * 0.01,
    },
    subtitleHint: {
        fontSize: Math.min(SCREEN_WIDTH * 0.04, 18),
        color: COLORS.textLight,
        textAlign: 'center',
    },
    stepCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: SCREEN_WIDTH * 0.05,
        marginBottom: SCREEN_HEIGHT * 0.02,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SCREEN_HEIGHT * 0.018,
    },
    stepNumber: {
        width: Math.min(SCREEN_WIDTH * 0.13, 56),
        height: Math.min(SCREEN_WIDTH * 0.13, 56),
        borderRadius: Math.min(SCREEN_WIDTH * 0.065, 28),
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SCREEN_WIDTH * 0.04,
    },
    stepNumberText: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        fontWeight: '700',
        color: 'white',
    },
    stepTitle: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        fontWeight: '700',
        color: COLORS.textDark,
        flex: 1,
        lineHeight: Math.min(SCREEN_WIDTH * 0.07, 30),
    },
    stepSpeaker: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        marginLeft: SCREEN_WIDTH * 0.02,
    },
    photo: {
        width: '100%',
        height: SCREEN_HEIGHT * 0.25,
        borderRadius: 8,
        marginBottom: SCREEN_HEIGHT * 0.018,
        resizeMode: 'cover',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    description: {
        fontSize: Math.min(SCREEN_WIDTH * 0.05, 22),
        color: COLORS.textMedium,
        lineHeight: Math.min(SCREEN_WIDTH * 0.07, 30),
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
        fontSize: Math.min(SCREEN_WIDTH * 0.045, 20),
        color: COLORS.textLight,
        textAlign: 'center',
    },
});
