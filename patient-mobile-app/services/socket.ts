import io, { Socket } from 'socket.io-client';

const SOCKET_URL = 'http://172.25.240.65:5001'; // Replace with your computer's IP (add :5001)
const PATIENT_ID = 1; // Hardcoded for demo

class SocketService {
    private socket: Socket | null = null;

    connect() {
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to server');
            this.joinPatientRoom(PATIENT_ID);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
        });

        return this.socket;
    }

    joinPatientRoom(patientId: number) {
        if (this.socket) {
            this.socket.emit('join_patient_room', { patient_id: patientId });
            console.log(`Joined room for patient ${patientId}`);
        }
    }

    // Expose socket for direct event handling
    on(event: string, callback: (...args: any[]) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        this.socket?.off(event, callback);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();