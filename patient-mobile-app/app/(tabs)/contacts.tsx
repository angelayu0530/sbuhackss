import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Image, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import socket from '@/services/socket';
import api from '@/services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Contact {
    id: number;
    name: string;
    relationship?: string;
    phone: string;
    photo_url?: string;
    is_primary?: boolean;
}

export default function EmergencyScreen() {
    const [primaryContact, setPrimaryContact] = useState<Contact | null>(null);
    const [patientInfo, setPatientInfo] = useState<any>(null);
    const [isImageEnlarged, setIsImageEnlarged] = useState(false);

    useEffect(() => {
        loadPrimaryContact();
        loadPatientInfo();

        socket.on('contacts_updated', () => {
            loadPrimaryContact();
        });

        return () => {
            socket.off('contacts_updated');
        };
    }, []);

    const loadPrimaryContact = async () => {
        try {
            const contacts = await api.getContacts();
            const primary = contacts.find((c: Contact) => c.is_primary);
            if (primary) {
                setPrimaryContact(primary);
            }
        } catch (error) {
            console.error('Failed to load contacts:', error);
        }
    };

    const loadPatientInfo = async () => {
        try {
            const data = await api.getHomeData();
            setPatientInfo(data);
        } catch (error) {
            console.error('Failed to load patient info:', error);
        }
    };

    const callCaregiver = () => {
        if (!primaryContact) {
            Alert.alert('No Caregiver', 'No primary caregiver contact found.');
            return;
        }

        Alert.alert(
            `Call ${primaryContact.name}?`,
            `This will dial ${primaryContact.phone}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call',
                    onPress: () => {
                        Linking.openURL(`tel:${primaryContact.phone}`);
                    },
                },
            ]
        );
    };

    const call911 = () => {
        Alert.alert(
            '🚨 Emergency Call',
            'This will call 911 Emergency Services',
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
        <LinearGradient
            colors={['#fce4ec', '#f8bbd0', '#f3e5f5']}
            style={styles.gradientContainer}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Emergency Contacts</Text>

                {/* ID Card Section */}
                <View style={styles.idCard}>
                    <Text style={styles.idTitle}>🆔 My Identification</Text>
                    <TouchableOpacity
                        style={styles.photoPlaceholder}
                        onPress={() => setIsImageEnlarged(true)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.idPhotoContainer}>
                            <View style={styles.idCardHeader}>
                                <View style={styles.headerBar} />
                            </View>
                            <View style={styles.idCardContent}>
                                <View style={styles.photoSection}>
                                    <View style={styles.avatarCircle}>
                                        <Text style={styles.avatarIcon}>👤</Text>
                                    </View>
                                </View>
                                <View style={styles.infoSection}>
                                    <View style={styles.infoLine} />
                                    <View style={styles.infoLine} />
                                    <View style={styles.infoLine} />
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {patientInfo?.patient_name && (
                        <Text style={styles.patientName}>{patientInfo.patient_name}</Text>
                    )}
                    <Text style={styles.idInstruction}>Tap photo to enlarge • Show this to others if you need help</Text>
                </View>

                {/* Call Caregiver Button */}
                <TouchableOpacity
                    style={styles.callButton}
                    onPress={callCaregiver}
                    disabled={!primaryContact}
                >
                    <LinearGradient
                        colors={['#43c07eff', '#3eb979ff', '#42b57cff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonIcon}>👨‍⚕️</Text>
                        <Text style={styles.buttonText}>
                            CALL CAREGIVER
                        </Text>
                        {primaryContact && (
                            <Text style={styles.buttonSubtext}>
                                {primaryContact.name} • {primaryContact.phone}
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Call 911 Button */}
                <TouchableOpacity style={styles.emergencyButton} onPress={call911}>
                    <LinearGradient
                        colors={['#d73535ff', '#dc2c2cff', '#ce2020ff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonIcon}>🚨</Text>
                        <Text style={styles.emergencyButtonText}>
                            CALL 911
                        </Text>
                        <Text style={styles.buttonSubtext}>
                            Emergency Services
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            {/* Enlarged Image Modal */}
            <Modal
                visible={isImageEnlarged}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsImageEnlarged(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setIsImageEnlarged(false)}
                    >
                        <View style={styles.enlargedImageContainer}>
                            <View style={styles.enlargedIdCard}>
                                <View style={styles.enlargedIdCardHeader}>
                                    <View style={styles.enlargedHeaderBar} />
                                </View>
                                <View style={styles.enlargedIdCardContent}>
                                    <View style={styles.enlargedPhotoSection}>
                                        <View style={styles.enlargedAvatarCircle}>
                                            <Text style={styles.enlargedAvatarIcon}>👤</Text>
                                        </View>
                                    </View>
                                    <View style={styles.enlargedInfoSection}>
                                        <View style={styles.enlargedInfoLine} />
                                        <View style={styles.enlargedInfoLine} />
                                        <View style={styles.enlargedInfoLine} />
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsImageEnlarged(false)}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </LinearGradient>
    );
} const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60,
        paddingBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    idCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        marginBottom: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 3,
        borderColor: '#b7a9e1',
    },
    idTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
    },
    photoPlaceholder: {
        width: 200,
        height: 250,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 15,
        borderWidth: 3,
        borderColor: '#e0e0e0',
    },
    idPhoto: {
        width: '100%',
        height: '100%',
    },
    photoEmpty: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoIcon: {
        fontSize: 64,
        marginBottom: 10,
    },
    photoText: {
        fontSize: 18,
        color: '#999',
        fontWeight: '600',
    },
    patientName: {
        fontSize: 26,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10,
    },
    idInstruction: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    callButton: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    emergencyButton: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonGradient: {
        padding: 30,
        alignItems: 'center',
    },
    buttonIcon: {
        fontSize: 56,
        marginBottom: 15,
    },
    buttonText: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 1,
    },
    emergencyButtonText: {
        fontSize: 36,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 2,
    },
    buttonSubtext: {
        fontSize: 16,
        color: 'white',
        marginTop: 8,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdrop: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    enlargedImageContainer: {
        width: SCREEN_WIDTH * 0.95,
        height: SCREEN_HEIGHT * 0.8,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enlargedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    closeButton: {
        position: 'absolute',
        top: -50,
        right: 10,
        backgroundColor: 'white',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButtonText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
    },
    // ID Card Placeholder Styles
    idPhotoContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e8e8e8',
        borderRadius: 12,
    },
    idCardHeader: {
        height: 40,
        backgroundColor: '#c0c0c0',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    headerBar: {
        height: 8,
        backgroundColor: '#a0a0a0',
        borderRadius: 4,
        width: '60%',
    },
    idCardContent: {
        flex: 1,
        flexDirection: 'row',
        padding: 15,
    },
    photoSection: {
        width: 90,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#b0b0b0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarIcon: {
        fontSize: 40,
    },
    infoSection: {
        flex: 1,
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    infoLine: {
        height: 12,
        backgroundColor: '#c8c8c8',
        borderRadius: 6,
        marginVertical: 8,
    },
    // Enlarged ID Card Styles
    enlargedIdCard: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e8e8e8',
        borderRadius: 15,
    },
    enlargedIdCardHeader: {
        height: 80,
        backgroundColor: '#c0c0c0',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    enlargedHeaderBar: {
        height: 16,
        backgroundColor: '#a0a0a0',
        borderRadius: 8,
        width: '60%',
    },
    enlargedIdCardContent: {
        flex: 1,
        flexDirection: 'row',
        padding: 40,
    },
    enlargedPhotoSection: {
        width: 180,
        marginRight: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enlargedAvatarCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#b0b0b0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    enlargedAvatarIcon: {
        fontSize: 80,
    },
    enlargedInfoSection: {
        flex: 1,
        justifyContent: 'space-around',
        paddingVertical: 20,
    },
    enlargedInfoLine: {
        height: 24,
        backgroundColor: '#c8c8c8',
        borderRadius: 12,
        marginVertical: 15,
    },
});
