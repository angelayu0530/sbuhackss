# Patient Mobile App Setup Guide

## Overview
The patient mobile app syncs in real-time with the caregiver dashboard using Socket.IO. When caregivers make changes (add FAQs, update navigation, send urgent messages), patients see updates instantly.

## What We've Built

### Backend (✅ Complete)
- **Socket.IO Real-time Server** - Bidirectional communication
- **4 New Database Tables**:
  - `patient_display_config` - Display settings
  - `navigation_landmarks` - Step-by-step directions home
  - `patient_faqs` - Common questions & answers
  - `emergency_contacts` - Quick-call contacts with photos
- **REST API Endpoints** (`/patient-display/*`)
  - Config management
  - Landmarks CRUD
  - FAQs CRUD
  - Emergency contacts CRUD
  - Urgent messaging
  - Mobile data endpoints (no auth required for patients)

### Frontend Dashboard (✅ Complete)
- **PatientDisplaySettings Component** - Full admin control panel
- **Real-time Sync Indicators** - Green badge when connected
- **Urgent Messaging** - Send push-like messages instantly
- **Photo Upload Support** - For landmarks and contacts
- **Caregiver Status Updates** - "At work", "On my way home", etc.

## Next Steps: Building the Mobile App

### Option 1: React Native (Recommended)

#### 1. Initialize React Native Project
\`\`\`bash
# Install Expo CLI globally
npm install -g expo-cli

# Create new project
npx create-expo-app patient-mobile-app
cd patient-mobile-app

# Install dependencies
npm install socket.io-client @react-navigation/native @react-navigation/stack
npm install react-native-paper axios dayjs
npx expo install react-native-screens react-native-safe-area-context
\`\`\`

#### 2. Install Socket.IO Client
\`\`\`bash
npm install socket.io-client
\`\`\`

#### 3. Create Socket Connection (`services/socket.ts`)
\`\`\`typescript
import io from 'socket.io-client';

const SOCKET_URL = 'http://YOUR_IP:5001'; // Replace with your computer's IP

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
});

export const connectToPatientRoom = (patientId: number) => {
  socket.emit('join_patient_room', { patient_id: patientId });
};

export const setupListeners = (callbacks: {
  onScheduleChange?: (data: any) => void;
  onLandmarksUpdate?: (data: any) => void;
  onFAQsUpdate?: (data: any) => void;
  onUrgentMessage?: (data: any) => void;
}) => {
  socket.on('schedule_changed', callbacks.onScheduleChange || (() => {}));
  socket.on('landmarks_updated', callbacks.onLandmarksUpdate || (() => {}));
  socket.on('faqs_updated', callbacks.onFAQsUpdate || (() => {}));
  socket.on('urgent_message', callbacks.onUrgentMessage || (() => {}));
};
\`\`\`

#### 4. Create API Service (`services/api.ts`)
\`\`\`typescript
const API_BASE = 'http://YOUR_IP:5001';

export const mobileAPI = {
  getHomeData: async (patientId: number) => {
    const res = await fetch(\`\${API_BASE}/patient-display/mobile/\${patientId}/home\`);
    return res.json();
  },
  
  getSchedule: async (patientId: number) => {
    const res = await fetch(\`\${API_BASE}/patient-display/mobile/\${patientId}/schedule\`);
    return res.json();
  },
  
  getNavigation: async (patientId: number) => {
    const res = await fetch(\`\${API_BASE}/patient-display/mobile/\${patientId}/navigation\`);
    return res.json();
  },
  
  getFAQs: async (patientId: number) => {
    const res = await fetch(\`\${API_BASE}/patient-display/mobile/\${patientId}/faqs\`);
    return res.json();
  },
  
  getContacts: async (patientId: number) => {
    const res = await fetch(\`\${API_BASE}/patient-display/mobile/\${patientId}/contacts\`);
    return res.json();
  },
};
\`\`\`

#### 5. Create Home Screen
See `/docs/mobile-app-screens.md` for full screen implementations

#### 6. Run the App
\`\`\`bash
# Start Expo development server
npx expo start

# Scan QR code with Expo Go app on your phone
# Or press 'i' for iOS simulator, 'a' for Android emulator
\`\`\`

### Testing the Integration

#### 1. Start Backend with Socket.IO
\`\`\`bash
cd backend
python main.py
# Should see: "Server initialized for threading" and Socket.IO running
\`\`\`

#### 2. Open Dashboard
\`\`\`bash
cd frontend
npm run dev
# Navigate to Patient Display Settings tab
\`\`\`

#### 3. Open Mobile App
\`\`\`bash
cd patient-mobile-app
npx expo start
# Open on phone via Expo Go
\`\`\`

#### 4. Test Real-time Sync
- **Add FAQ** in dashboard → Should appear instantly on mobile
- **Add Landmark** → Mobile navigation updates immediately
- **Send Urgent Message** → Notification pops up on phone
- **Change Caregiver Status** → Status updates on home screen

## Key Features Implemented

### For Caregivers (Dashboard)
✅ Configure what patient sees
✅ Upload navigation landmarks with photos
✅ Create custom FAQ responses
✅ Manage emergency contacts
✅ Send urgent push-like messages
✅ Set caregiver status ("At work", etc.)
✅ Enable/disable GPS tracking
✅ Configure voice reminders

### For Patients (Mobile - To Build)
📱 Large text, simple UI
📱 Today's schedule with photos
📱 "How to Get Home" with step-by-step photos
📱 FAQ section with voice playback
📱 One-tap emergency calling
📱 Real-time updates from caregiver
📱 Urgent message notifications

## Architecture Overview

\`\`\`
┌─────────────────┐         WebSocket/HTTP          ┌──────────────────┐
│   Dashboard     │◄────────────────────────────────►│   Flask Server   │
│   (Caregiver)   │                                  │   + Socket.IO    │
└─────────────────┘                                  └──────────────────┘
                                                              ▲
                                                              │
                                                         WebSocket/HTTP
                                                              │
                                                              ▼
                                                     ┌──────────────────┐
                                                     │   Mobile App     │
                                                     │   (Patient)      │
                                                     └──────────────────┘
\`\`\`

### Data Flow Example: Adding FAQ
1. Caregiver types FAQ in dashboard → Clicks "Add FAQ"
2. Dashboard POST to `/patient-display/faqs/{patientId}`
3. Backend saves to database
4. Backend emits Socket.IO event: `faqs_updated`
5. Mobile app listening on `patient_{patientId}` room receives event
6. Mobile app fetches updated FAQs
7. UI updates instantly - patient sees new FAQ

## Troubleshooting

### Socket.IO Not Connecting
- Make sure backend is running with `socketio.run()` not `app.run()`
- Check firewall allows port 5001
- Use your computer's local IP (192.168.x.x), not localhost
- Mobile device must be on same WiFi network

### CORS Errors
- Backend already configured with `cors_allowed_origins="*"`
- Check Flask-CORS is installed

### Database Errors
- Run `python backend/create_patient_display_tables.py` if migrations fail
- Check PostgreSQL is running

## Security Notes (Production)

⚠️ Before deploying to production:
- [ ] Add authentication to mobile API endpoints
- [ ] Validate patient ownership of resources
- [ ] Use HTTPS for all connections
- [ ] Implement rate limiting
- [ ] Add proper CORS restrictions
- [ ] Encrypt sensitive data (addresses, phone numbers)
- [ ] Add photo upload to cloud storage (S3, Cloudinary)
- [ ] Implement proper session management

## Next Features to Add

### Phase 2
- [ ] Photo upload from dashboard (currently URLs only)
- [ ] Voice recording for FAQ answers
- [ ] GPS geofencing alerts
- [ ] Medication photo recognition
- [ ] Video calling integration

### Phase 3
- [ ] Offline mode support
- [ ] Health metrics tracking
- [ ] Activity logging
- [ ] Multi-language support
- [ ] Dark mode for low-light environments

## Files Created

### Backend
- `backend/socketio_instance.py` - Socket.IO initialization
- `backend/patient_display/routes.py` - API endpoints
- `backend/models.py` - 4 new models added
- `backend/create_patient_display_tables.py` - Manual table creation
- `backend/main.py` - Socket.IO integration

### Frontend
- `frontend/src/services/api.ts` - patientDisplayAPI added
- `frontend/src/components/patient-display/PatientDisplaySettings.tsx` - Admin UI

### To Create (Mobile)
- `patient-mobile-app/services/socket.ts`
- `patient-mobile-app/services/api.ts`
- `patient-mobile-app/screens/HomeScreen.tsx`
- `patient-mobile-app/screens/ScheduleScreen.tsx`
- `patient-mobile-app/screens/NavigationScreen.tsx`
- `patient-mobile-app/screens/FAQScreen.tsx`
- `patient-mobile-app/screens/ContactsScreen.tsx`

## Resources

- Socket.IO Client Docs: https://socket.io/docs/v4/client-api/
- React Native Docs: https://reactnative.dev/
- Expo Docs: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/

---

**Ready to start building?** Follow Option 1 above to create the React Native app!
