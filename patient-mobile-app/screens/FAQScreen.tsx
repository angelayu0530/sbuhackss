import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
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

const PATIENT_ID = 1;

export default function FAQScreen() {
    const [faqs, setFaqs] = useState<any[]>([]);

    useEffect(() => {
        loadFAQs();

        // Listen for FAQ updates
        socket.on('faqs_updated', () => {
            loadFAQs();
        });

        return () => {
            socket.off('faqs_updated');
        };
    }, []);

    const loadFAQs = async () => {
        try {
            const data = await api.getFAQs();
            setFaqs(data);
        } catch (error) {
            console.error('Error loading FAQs:', error);
        }
    };

    const speakAnswer = (text: string, question?: string) => {
        const fullText = question ? `${question}. ${text}` : text;
        Speech.speak(fullText, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.75, // Slower for elderly
        });
    };

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => speakAnswer('Common Questions. Tap any question to hear the answer.')}
                activeOpacity={0.8}
            >
                <Text style={styles.headerText}>Common Questions 🔊</Text>
                <Text style={styles.subHeader}>Tap any question to hear the answer</Text>
            </TouchableOpacity>

            {faqs.map((faq, index) => (
                <TouchableOpacity
                    key={faq.id || index}
                    style={styles.faqCard}
                    onPress={() => speakAnswer(faq.answer_text, faq.question)}
                    activeOpacity={0.7}
                >
                    <View style={styles.faqIconContainer}>
                        <Text style={styles.faqIcon}>🔊</Text>
                    </View>
                    <View style={styles.faqContent}>
                        <Text style={styles.question}>{faq.question}</Text>
                        <Text style={styles.answer}>{faq.answer_text}</Text>
                    </View>
                </TouchableOpacity>
            ))}

            {faqs.length === 0 && (
                <TouchableOpacity
                    style={styles.emptyState}
                    onPress={() => speakAnswer('No questions available yet.')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.emptyText}>No questions yet 🔊</Text>
                    <Text style={styles.emptySubtext}>Tap to hear this message</Text>
                </TouchableOpacity>
            )}
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
        paddingVertical: SCREEN_HEIGHT * 0.045,
        paddingHorizontal: SCREEN_WIDTH * 0.05,
        alignItems: 'center',
    },
    headerText: {
        fontSize: Math.min(SCREEN_WIDTH * 0.085, 38),
        fontWeight: '700',
        color: 'white',
    },
    subHeader: {
        fontSize: Math.min(SCREEN_WIDTH * 0.05, 22),
        color: 'white',
        marginTop: SCREEN_HEIGHT * 0.012,
    },
    faqCard: {
        backgroundColor: COLORS.cardBg,
        marginHorizontal: SCREEN_WIDTH * 0.04,
        marginVertical: SCREEN_HEIGHT * 0.012,
        padding: SCREEN_WIDTH * 0.06,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    faqIconContainer: {
        marginRight: SCREEN_WIDTH * 0.04,
        marginTop: SCREEN_HEIGHT * 0.005,
    },
    faqIcon: {
        fontSize: Math.min(SCREEN_WIDTH * 0.11, 48),
    },
    faqContent: {
        flex: 1,
    },
    question: {
        fontSize: Math.min(SCREEN_WIDTH * 0.065, 28),
        fontWeight: '700',
        color: COLORS.textDark,
        marginBottom: SCREEN_HEIGHT * 0.012,
        lineHeight: Math.min(SCREEN_WIDTH * 0.08, 34),
    },
    answer: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        color: COLORS.textMedium,
        lineHeight: Math.min(SCREEN_WIDTH * 0.075, 32),
    },
    emptyState: {
        paddingVertical: SCREEN_HEIGHT * 0.08,
        paddingHorizontal: SCREEN_WIDTH * 0.1,
        marginHorizontal: SCREEN_WIDTH * 0.04,
        marginTop: SCREEN_HEIGHT * 0.05,
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyText: {
        fontSize: Math.min(SCREEN_WIDTH * 0.065, 28),
        color: COLORS.textMedium,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: SCREEN_HEIGHT * 0.01,
    },
    emptySubtext: {
        fontSize: Math.min(SCREEN_WIDTH * 0.045, 20),
        color: COLORS.textLight,
        textAlign: 'center',
    },
});