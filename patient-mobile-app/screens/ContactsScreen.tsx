import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Dimensions } from 'react-native';
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
    emergency: '#FF5252',
    callButton: '#4CAF50',
};

const PATIENT_ID = 1;

export default function ContactsScreen() {
    const [contacts, setContacts] = useState<any[]>([]);

    useEffect(() => {
        loadContacts();

        socket.on('contacts_updated', () => {
            loadContacts();
        });

        return () => {
            socket.off('contacts_updated');
        };
    }, []);

    const loadContacts = async () => {
        try {
            const data = await api.getContacts();
            setContacts(data);
        } catch (error) {
            console.error('Error loading contacts:', error);
        }
    };

    const speak = (text: string) => {
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.75,
        });
    };

    const callContact = (phone: string, name: string) => {
        Alert.alert(
            `Call ${name}?`,
            `This will dial ${phone}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call',
                    onPress: () => {
                        Linking.openURL(`tel:${phone}`);
                    },
                },
            ]
        );
    };

    const call911 = () => {
        Alert.alert(
            'Emergency Call',
            'This will call 911',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call 911',
                    onPress: () => {
                        Linking.openURL('tel:911');
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => speak('Emergency Contacts. Tap any contact to call them.')}
                activeOpacity={0.8}
            >
                <Text style={styles.headerText}>Emergency Contacts 🔊</Text>
                <Text style={styles.subHeader}>Tap any contact to call</Text>
            </TouchableOpacity>

            {contacts.map((contact, index) => (
                <View key={contact.id || index} style={styles.contactWrapper}>
                    <TouchableOpacity
                        style={styles.infoButton}
                        onPress={() => speak(`${contact.name}. ${contact.relationship || ''}. Phone number ${contact.phone}${contact.is_primary ? '. This is your primary contact.' : ''}`)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.speakerIconSmall}>🔊</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.contactCard,
                            contact.is_primary && styles.primaryContact,
                        ]}
                        onPress={() => callContact(contact.phone, contact.name)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.contactInfo}>
                            <Text style={styles.name}>{contact.name}</Text>
                            {contact.relationship && (
                                <Text style={styles.relationship}>{contact.relationship}</Text>
                            )}
                            <Text style={styles.phone}>{contact.phone}</Text>
                            {contact.is_primary && (
                                <View style={styles.primaryBadge}>
                                    <Text style={styles.primaryText}>Primary Contact</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.callButton}>
                            <Text style={styles.callIcon}>📞</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ))}

            {/* 911 Emergency */}
            <View style={styles.emergencyWrapper}>
                <TouchableOpacity
                    style={styles.emergencyInfoButton}
                    onPress={() => speak('Emergency. Call 9 1 1 for immediate help.')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.speakerIconSmall}>🔊</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.emergencyCard} onPress={call911} activeOpacity={0.8}>
                    <Text style={styles.emergencyIcon}>🚨</Text>
                    <View>
                        <Text style={styles.emergencyText}>EMERGENCY</Text>
                        <Text style={styles.emergencySubtext}>Call 911</Text>
                    </View>
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
    contactWrapper: {
        position: 'relative',
        marginHorizontal: SCREEN_WIDTH * 0.04,
        marginVertical: SCREEN_HEIGHT * 0.01,
    },
    infoButton: {
        position: 'absolute',
        top: -SCREEN_HEIGHT * 0.015,
        left: SCREEN_WIDTH * 0.02,
        backgroundColor: COLORS.secondary,
        width: Math.min(SCREEN_WIDTH * 0.12, 52),
        height: Math.min(SCREEN_WIDTH * 0.12, 52),
        borderRadius: Math.min(SCREEN_WIDTH * 0.06, 26),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    speakerIconSmall: {
        fontSize: Math.min(SCREEN_WIDTH * 0.06, 26),
    },
    contactCard: {
        backgroundColor: COLORS.cardBg,
        padding: SCREEN_WIDTH * 0.06,
        paddingTop: SCREEN_WIDTH * 0.08,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryContact: {
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    contactInfo: {
        flex: 1,
    },
    name: {
        fontSize: Math.min(SCREEN_WIDTH * 0.075, 32),
        fontWeight: '700',
        color: COLORS.textDark,
    },
    relationship: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        color: COLORS.textMedium,
        marginTop: SCREEN_HEIGHT * 0.008,
    },
    phone: {
        fontSize: Math.min(SCREEN_WIDTH * 0.06, 26),
        color: COLORS.primary,
        marginTop: SCREEN_HEIGHT * 0.012,
        fontWeight: '700',
    },
    primaryBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SCREEN_WIDTH * 0.04,
        paddingVertical: SCREEN_HEIGHT * 0.01,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: SCREEN_HEIGHT * 0.012,
    },
    primaryText: {
        color: 'white',
        fontSize: Math.min(SCREEN_WIDTH * 0.04, 18),
        fontWeight: '700',
    },
    callButton: {
        backgroundColor: COLORS.callButton,
        width: Math.min(SCREEN_WIDTH * 0.22, 95),
        height: Math.min(SCREEN_WIDTH * 0.22, 95),
        borderRadius: Math.min(SCREEN_WIDTH * 0.11, 48),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    callIcon: {
        fontSize: Math.min(SCREEN_WIDTH * 0.11, 48),
    },
    emergencyWrapper: {
        position: 'relative',
        marginHorizontal: SCREEN_WIDTH * 0.04,
        marginVertical: SCREEN_HEIGHT * 0.02,
        marginBottom: SCREEN_HEIGHT * 0.04,
    },
    emergencyInfoButton: {
        position: 'absolute',
        top: -SCREEN_HEIGHT * 0.015,
        left: SCREEN_WIDTH * 0.02,
        backgroundColor: COLORS.secondary,
        width: Math.min(SCREEN_WIDTH * 0.12, 52),
        height: Math.min(SCREEN_WIDTH * 0.12, 52),
        borderRadius: Math.min(SCREEN_WIDTH * 0.06, 26),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    emergencyCard: {
        backgroundColor: COLORS.emergency,
        paddingVertical: SCREEN_HEIGHT * 0.045,
        paddingHorizontal: SCREEN_WIDTH * 0.06,
        paddingTop: SCREEN_HEIGHT * 0.06,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    emergencyIcon: {
        fontSize: Math.min(SCREEN_WIDTH * 0.14, 60),
        marginRight: SCREEN_WIDTH * 0.06,
    },
    emergencyText: {
        fontSize: Math.min(SCREEN_WIDTH * 0.09, 40),
        fontWeight: '800',
        color: 'white',
    },
    emergencySubtext: {
        fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
        color: 'white',
        fontWeight: '700',
        marginTop: SCREEN_HEIGHT * 0.008,
    },
});