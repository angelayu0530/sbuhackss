import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import socket from '@/services/socket';
import api from '@/services/api';

interface FAQ {
    id: number;
    question: string;
    answer_text: string;
    voice_recording_url?: string;
}

export default function FAQScreen() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [speakingId, setSpeakingId] = useState<number | null>(null);

    useEffect(() => {
        loadFAQs();

        socket.on('config_updated', (data) => {
            if (data.show_faq !== undefined) {
                loadFAQs();
            }
        });

        socket.on('faqs_updated', () => {
            loadFAQs();
        });

        return () => {
            socket.off('config_updated');
            socket.off('faqs_updated');
            Speech.stop();
        };
    }, []);

    const loadFAQs = async () => {
        try {
            const data = await api.getFAQs();
            setFaqs(data);
        } catch (error) {
            console.error('Failed to load FAQs:', error);
        }
    };

    const speakAnswer = (faq: FAQ) => {
        if (speakingId === faq.id) {
            Speech.stop();
            setSpeakingId(null);
        } else {
            Speech.stop();
            setSpeakingId(faq.id);
            Speech.speak(faq.answer_text, {
                language: 'en',
                pitch: 1.0,
                rate: 0.8,
                onDone: () => setSpeakingId(null),
                onStopped: () => setSpeakingId(null),
            });
        }
    };

    return (
        <LinearGradient
            colors={['#fff3e0', '#ffe0b2', '#ffecb3']}
            style={styles.gradientContainer}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <LinearGradient
                    colors={['#ffb74d', '#ffa726', '#ff9800']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.headerCard}
                >
                    <Text style={styles.title}>Frequently Asked Questions</Text>
                    <Text style={styles.subtitle}>Tap any answer to hear it spoken</Text>
                </LinearGradient>

                {faqs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No FAQs available</Text>
                        <Text style={styles.emptySubtext}>Your caregiver hasn't added any questions yet</Text>
                    </View>
                ) : (
                    faqs.map((faq) => (
                        <View key={faq.id} style={styles.faqCard}>
                            <Text style={styles.question}>Q: {faq.question}</Text>
                            <TouchableOpacity
                                style={[styles.answerButton, speakingId === faq.id && styles.answerButtonActive]}
                                onPress={() => speakAnswer(faq)}
                            >
                                <Text style={styles.answerLabel}>
                                    {speakingId === faq.id ? '🔊 Speaking...' : '🔊 Tap to Hear Answer'}
                                </Text>
                                <Text style={styles.answer}>{faq.answer_text}</Text>
                            </TouchableOpacity>
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
    headerCard: {
        padding: 20,
        borderRadius: 15,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'white',
    },
    faqCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    question: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    answerButton: {
        backgroundColor: '#ffe0b2',
        borderRadius: 8,
        padding: 16,
        borderWidth: 2,
        borderColor: '#ffb74d',
    },
    answerButtonActive: {
        backgroundColor: '#ffb74d',
    },
    answerLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e65100',
        marginBottom: 8,
    },
    answer: {
        fontSize: 18,
        color: '#333',
        lineHeight: 26,
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
