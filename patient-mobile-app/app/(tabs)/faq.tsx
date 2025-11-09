import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import api from '@/services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FAQ {
    id: number;
    question: string;
    answer_text: string;
    voice_recording_url?: string;
}

export default function FAQScreen() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);

    useEffect(() => {
        loadFAQs();
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
            rate: 0.75,
        });
    };

    return (
        <LinearGradient
            colors={['#fff5f0', '#fef1e6', '#fcead8']}
            style={styles.container}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity
                    style={styles.header}
                    onPress={() => speakAnswer('Common Questions. Tap any question to hear the answer.')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.headerText}>Common Questions</Text>
                    <Text style={styles.headerIcon}>🔊</Text>
                </TouchableOpacity>

                <Text style={styles.subHeader}>Tap any question to hear the answer</Text>

                {faqs.length === 0 ? (
                    <TouchableOpacity
                        style={styles.emptyState}
                        onPress={() => speakAnswer('No questions available yet.')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.emptyIcon}>💭</Text>
                        <Text style={styles.emptyText}>No questions yet</Text>
                        <Text style={styles.emptySubtext}>Tap to hear 🔊</Text>
                    </TouchableOpacity>
                ) : (
                    faqs.map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            style={styles.faqCard}
                            onPress={() => speakAnswer(faq.answer_text, faq.question)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={styles.faqIcon}>🔊</Text>
                                <Text style={styles.question}>{faq.question}</Text>
                            </View>
                            <Text style={styles.answer}>{faq.answer_text}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 30,
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    headerText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#333',
    },
    headerIcon: {
        fontSize: 32,
    },
    subHeader: {
        fontSize: 18,
        color: '#666',
        marginBottom: 30,
    },
    faqCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 25,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 2,
        borderColor: 'rgba(255, 166, 127, 0.3)',
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    faqIcon: {
        fontSize: 32,
        marginRight: 15,
        marginTop: 2,
    },
    question: {
        fontSize: 26,
        fontWeight: '700',
        color: '#333',
        flex: 1,
        lineHeight: 34,
    },
    answer: {
        fontSize: 22,
        color: '#555',
        lineHeight: 32,
        paddingLeft: 47,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 50,
        marginTop: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255, 166, 127, 0.3)',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 28,
        color: '#666',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 20,
        color: '#999',
        textAlign: 'center',
    },
});
