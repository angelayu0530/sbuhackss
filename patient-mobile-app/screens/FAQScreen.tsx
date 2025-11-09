import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import socket from '../services/socket';
import api from '../services/api';

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

    const speakAnswer = (text: string) => {
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.8, // Slower for clarity
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Common Questions</Text>
                <Text style={styles.subHeader}>Tap any question to hear the answer</Text>
            </View>

            {faqs.map((faq, index) => (
                <TouchableOpacity
                    key={faq.id || index}
                    style={styles.faqCard}
                    onPress={() => speakAnswer(faq.answer_text)}
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
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No questions yet</Text>
                </View>
            )}
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
    headerText: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
    },
    subHeader: {
        fontSize: 18,
        color: 'white',
        marginTop: 10,
    },
    faqCard: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    faqIconContainer: {
        marginRight: 20,
    },
    faqIcon: {
        fontSize: 40,
    },
    faqContent: {
        flex: 1,
    },
    question: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10,
    },
    answer: {
        fontSize: 20,
        color: '#666',
        lineHeight: 28,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 24,
        color: '#999',
    },
});