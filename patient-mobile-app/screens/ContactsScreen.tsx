import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import socket from '../services/socket';
import api from '../services/api';

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
            <View style={styles.header}>
                <Text style={styles.headerText}>Emergency Contacts</Text>
                <Text style={styles.subHeader}>Tap to call</Text>
            </View>

            {contacts.map((contact, index) => (
                <TouchableOpacity
                    key={contact.id || index}
                    style={[
                        styles.contactCard,
                        contact.is_primary && styles.primaryContact,
                    ]}
                    onPress={() => callContact(contact.phone, contact.name)}
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
            ))}

            {/* 911 Emergency */}
            <TouchableOpacity style={styles.emergencyCard} onPress={call911}>
                <Text style={styles.emergencyIcon}>🚨</Text>
                <View>
                    <Text style={styles.emergencyText}>EMERGENCY</Text>
                    <Text style={styles.emergencySubtext}>Call 911</Text>
                </View>
            </TouchableOpacity>
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
    contactCard: {
        backgroundColor: 'white',
        margin: 15,
        padding: 25,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryContact: {
        borderWidth: 3,
        borderColor: '#6fb8d5',
    },
    contactInfo: {
        flex: 1,
    },
    name: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
    },
    relationship: {
        fontSize: 20,
        color: '#666',
        marginTop: 5,
    },
    phone: {
        fontSize: 22,
        color: '#6fb8d5',
        marginTop: 10,
        fontWeight: '600',
    },
    primaryBadge: {
        backgroundColor: '#6fb8d5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    primaryText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    callButton: {
        backgroundColor: '#4CAF50',
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    callIcon: {
        fontSize: 40,
    },
    emergencyCard: {
        backgroundColor: '#FF5252',
        margin: 15,
        padding: 30,
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
        fontSize: 48,
        marginRight: 20,
    },
    emergencyText: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
    },
    emergencySubtext: {
        fontSize: 20,
        color: 'white',
        marginTop: 5,
    },
});