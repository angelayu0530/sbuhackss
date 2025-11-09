import { useEffect, useState, type JSX } from 'react';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconPhone, IconMapPin } from '@tabler/icons-react';
import { io, Socket } from 'socket.io-client';

interface Alert {
    type: string;
    patient_id: number;
    patient_name: string;
    message: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    location?: {
        latitude?: number;
        longitude?: number;
        address?: string;
    };
}

let socket: Socket | null = null;

export function PatientAlerts({ caregiverId }: { caregiverId?: number }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        // Connect to Socket.IO server
        socket = io('http://localhost:5001', {
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('Connected to alert system');

            // Join caregiver room if ID provided
            if (caregiverId) {
                socket?.emit('join_caregiver_room', { caregiver_id: caregiverId });
            }
        });

        // Listen for patient alerts
        socket.on('patient_alert', (alert: Alert) => {
            console.log('Received patient alert:', alert);
            setAlerts(prev => [alert, ...prev]);
            showAlertNotification(alert);
        });

        // Listen for emergency alerts
        socket.on('emergency_alert', (alert: Alert) => {
            console.log('EMERGENCY ALERT:', alert);
            setAlerts(prev => [alert, ...prev]);
            showAlertNotification(alert);
        });

        // Listen for location alerts
        socket.on('location_alert', (alert: Alert) => {
            console.log('Location alert:', alert);
            setAlerts(prev => [alert, ...prev]);
            showAlertNotification(alert);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from alert system');
        });

        return () => {
            socket?.disconnect();
        };
    }, [caregiverId]);

    const showAlertNotification = (alert: Alert) => {
        const colors: Record<string, string> = {
            low: 'blue',
            medium: 'yellow',
            high: 'orange',
            urgent: 'red',
        };

        const icons: Record<string, JSX.Element> = {
            call_request: <IconPhone size={20} />,
            emergency_911: <IconAlertCircle size={20} />,
            navigation_help: <IconMapPin size={20} />,
        };

        notifications.show({
            title: alert.type === 'emergency_911' ? '🚨 EMERGENCY!' : 'Patient Alert',
            message: (
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                        {alert.message}
                    </div>
                    {alert.location?.address && (
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                            📍 Location: {alert.location.address}
                        </div>
                    )}
                    <div style={{ fontSize: '0.8em', color: '#999', marginTop: 4 }}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                </div>
            ),
            color: colors[alert.priority] || 'blue',
            icon: icons[alert.type] || <IconAlertCircle size={20} />,
            autoClose: alert.priority === 'urgent' ? false : 10000,
            withCloseButton: true,
            style: {
                backgroundColor: alert.priority === 'urgent' ? '#fff5f5' : undefined,
            },
        });

        // Play sound for urgent alerts
        if (alert.priority === 'urgent') {
            playAlertSound();
        }
    };

    const playAlertSound = () => {
        try {
            const audio = new Audio('/alert-sound.mp3');
            audio.play().catch(err => console.log('Could not play sound:', err));
        } catch (err) {
            console.log('Audio not available');
        }
    };

    return null; // This is a background component
}

export default PatientAlerts;
