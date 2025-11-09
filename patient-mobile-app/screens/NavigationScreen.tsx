import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import socket from '../services/socket';
import api from '../services/api';

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

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.subtitle}>Follow these steps to get home safely</Text>

            {landmarks.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No navigation steps available</Text>
                    <Text style={styles.emptySubtext}>Contact your caregiver for directions</Text>
                </View>
            ) : (
                landmarks.map((landmark) => (
                    <View key={landmark.id} style={styles.stepCard}>
                        <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{landmark.step_number}</Text>
                            </View>
                            <Text style={styles.stepTitle}>{landmark.title}</Text>
                        </View>

                        {landmark.photo_url && (
                            <Image source={{ uri: landmark.photo_url }} style={styles.photo} />
                        )}

                        <Text style={styles.description}>{landmark.description}</Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        padding: 20,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    stepCard: {
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
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6fb8d5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    photo: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
        resizeMode: 'cover',
    },
    description: {
        fontSize: 18,
        color: '#555',
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
