# 📱 Mobile App - Complete Setup Guide

## 🚀 Quick Start (Follow These Steps)

### Step 1: Create the App

Open a new terminal and run:
\`\`\`bash
npx create-expo-app patient-mobile-app
cd patient-mobile-app
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
npm install socket.io-client axios dayjs
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context expo-speech
\`\`\`

### Step 3: Create Folder Structure

\`\`\`bash
mkdir services
mkdir screens
\`\`\`

Your folder structure will look like:
\`\`\`
patient-mobile-app/
├── App.tsx          (REPLACE this file)
├── services/
│   ├── socket.ts    (CREATE this file)
│   └── api.ts       (CREATE this file)
└── screens/
    ├── HomeScreen.tsx      (CREATE this file)
    ├── FAQScreen.tsx       (CREATE this file)
    └── ContactsScreen.tsx  (CREATE this file)
\`\`\`

### Step 4: Find Your Computer's IP Address

Run this command to find your IP:
\`\`\`bash
# On Mac/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows:
ipconfig
\`\`\`

Look for something like: **192.168.1.100** (your local network IP)

---

## 📝 Copy These Files (In Order)

### File 1: `services/socket.ts`

**Location:** Create file `patient-mobile-app/services/socket.ts`

**Instructions:** 
1. Create the file `services/socket.ts` 
2. Copy ALL the code below
3. **CHANGE** the IP address on line 3 to YOUR computer's IP

### 1. Socket Service (`services/socket.ts`)

\`\`\`typescript
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.100:5001'; // Replace with your computer's IP

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    return this.socket;
  }

  joinPatientRoom(patientId: number) {
    if (this.socket) {
      this.socket.emit('join_patient_room', { patient_id: patientId });
      console.log(\`Joined room for patient \${patientId}\`);
    }
  }

  onScheduleUpdate(callback: (data: any) => void) {
    this.socket?.on('schedule_changed', callback);
  }

  onLandmarksUpdate(callback: (data: any) => void) {
    this.socket?.on('landmarks_updated', callback);
  }

  onFAQsUpdate(callback: (data: any) => void) {
    this.socket?.on('faqs_updated', callback);
  }

  onContactsUpdate(callback: (data: any) => void) {
    this.socket?.on('contacts_updated', callback);
  }

  onUrgentMessage(callback: (data: any) => void) {
    this.socket?.on('urgent_message', (data) => {
      console.log('🚨 Urgent message received:', data.message);
      callback(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
\`\`\`

---

### File 2: `services/api.ts`

**Location:** Create file `patient-mobile-app/services/api.ts`

**Instructions:** 
1. Create the file `services/api.ts`
2. Copy ALL the code below  
3. **CHANGE** the IP address on line 1 to YOUR computer's IP

\`\`\`typescript
const API_BASE = 'http://192.168.1.100:5001'; // Replace with your computer's IP

export interface ScheduleItem {
  id: number;
  start_time: string;
  end_time: string;
  location?: string;
}

export interface Landmark {
  step_number: number;
  title: string;
  description?: string;
  photo_url?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer_text: string;
  voice_recording_url?: string;
}

export interface Contact {
  id: number;
  name: string;
  relationship?: string;
  phone: string;
  photo_url?: string;
  is_primary?: boolean;
}

export const mobileAPI = {
  getHomeData: async (patientId: number) => {
    const res = await fetch(\`\${API_BASE}/patient-display/mobile/\${patientId}/home\`);
    return res.json();
  },

  getSchedule: async (patientId: number): Promise<ScheduleItem[]> => {
    const res = await fetch(\`\${API_BASE}/patient-display/mobile/\${patientId}/schedule\`);
    return res.json();
  },

  getNavigation: async (patientId: number) => {
    const res = await fetch(\`\${API_BASE}/patient-display/mobile/\${patientId}/navigation\`);
    return res.json();
  },

  getFAQs: async (patientId: number): Promise<FAQ[]> => {
    const res = await fetch(\`\${API_BASE}/patient-display/mobile/\${patientId}/faqs\`);
    return res.json();
  },

  getContacts: async (patientId: number): Promise<Contact[]> => {
    const res = await fetch(\`\${API_BASE}/patient-display/mobile/\${patientId}/contacts\`);
    return res.json();
  },
};
\`\`\`

---

### File 3: `screens/HomeScreen.tsx`

**Location:** Create file `patient-mobile-app/screens/HomeScreen.tsx`

**Instructions:** 
1. Create the file `screens/HomeScreen.tsx`
2. Copy ALL the code below (no changes needed)

\`\`\`typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import socketService from '../services/socket';
import { mobileAPI } from '../services/api';
import dayjs from 'dayjs';

const PATIENT_ID = 1; // Replace with actual patient ID

export default function HomeScreen({ navigation }: any) {
  const [homeData, setHomeData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    // Connect to Socket.IO
    socketService.connect();
    socketService.joinPatientRoom(PATIENT_ID);

    // Set up real-time listeners
    socketService.onScheduleUpdate(() => {
      loadHomeData();
    });

    socketService.onUrgentMessage((data) => {
      Alert.alert('Message from Caregiver', data.message, [{ text: 'OK' }]);
    });

    // Load initial data
    loadHomeData();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);

    return () => {
      clearInterval(timer);
      socketService.disconnect();
    };
  }, []);

  const loadHomeData = async () => {
    try {
      const data = await mobileAPI.getHomeData(PATIENT_ID);
      setHomeData(data);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.hour();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!homeData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.time}>{currentTime.format('h:mm A')}</Text>
        <Text style={styles.greeting}>{getGreeting()}!</Text>
        <Text style={styles.date}>{currentTime.format('dddd, MMMM D')}</Text>
      </View>

      {/* Caregiver Status */}
      {homeData.caregiver_status && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Your Caregiver</Text>
          <Text style={styles.cardText}>{homeData.caregiver_status}</Text>
        </View>
      )}

      {/* Today's Schedule */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Today's Schedule</Text>
        {homeData.schedule && homeData.schedule.length > 0 ? (
          homeData.schedule.slice(0, 3).map((item: any, index: number) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>
                {dayjs(item.start_time).format('h:mm A')}
              </Text>
              <Text style={styles.scheduleLocation}>{item.location || 'Event'}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.cardText}>No events scheduled today</Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Text style={styles.buttonText}>View Full Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Where Am I */}
      {homeData.home_address && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Where Am I?</Text>
          <Text style={styles.cardText}>Home - {homeData.home_address}</Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.navigate('Navigation')}
          >
            <Text style={styles.buttonText}>How to Get Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => navigation.navigate('FAQ')}
        >
          <Text style={styles.quickButtonText}>❓</Text>
          <Text style={styles.quickButtonLabel}>Help</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Text style={styles.quickButtonText}>☎️</Text>
          <Text style={styles.quickButtonLabel}>Call</Text>
        </TouchableOpacity>
      </View>
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
  time: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '600',
    color: 'white',
    marginTop: 10,
  },
  date: {
    fontSize: 20,
    color: 'white',
    marginTop: 5,
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  cardText: {
    fontSize: 20,
    color: '#666',
    lineHeight: 28,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scheduleTime: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6fb8d5',
    width: 120,
  },
  scheduleLocation: {
    fontSize: 22,
    color: '#333',
    flex: 1,
  },
  button: {
    backgroundColor: '#6fb8d5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonSecondary: {
    backgroundColor: '#ffa67f',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginBottom: 30,
  },
  quickButton: {
    backgroundColor: 'white',
    width: 140,
    height: 140,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickButtonText: {
    fontSize: 48,
  },
  quickButtonLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  loadingText: {
    fontSize: 24,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
});
\`\`\`

---

### File 4: `screens/FAQScreen.tsx`

**Location:** Create file `patient-mobile-app/screens/FAQScreen.tsx`

**Instructions:**
1. Create the file `screens/FAQScreen.tsx`
2. Copy ALL the code below (no changes needed)

\`\`\`typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import socketService from '../services/socket';
import { mobileAPI } from '../services/api';

const PATIENT_ID = 1;

export default function FAQScreen() {
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    loadFAQs();

    // Listen for FAQ updates
    socketService.onFAQsUpdate(() => {
      loadFAQs();
    });
  }, []);

  const loadFAQs = async () => {
    try {
      const data = await mobileAPI.getFAQs(PATIENT_ID);
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
\`\`\`

---

### File 5: `screens/ContactsScreen.tsx`

**Location:** Create file `patient-mobile-app/screens/ContactsScreen.tsx`

**Instructions:**
1. Create the file `screens/ContactsScreen.tsx`
2. Copy ALL the code below (no changes needed)

\`\`\`typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import socketService from '../services/socket';
import { mobileAPI } from '../services/api';

const PATIENT_ID = 1;

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    loadContacts();

    socketService.onContactsUpdate(() => {
      loadContacts();
    });
  }, []);

  const loadContacts = async () => {
    try {
      const data = await mobileAPI.getContacts(PATIENT_ID);
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const callContact = (phone: string, name: string) => {
    Alert.alert(
      \`Call \${name}?\`,
      \`This will dial \${phone}\`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(\`tel:\${phone}\`);
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
\`\`\`

---

### File 6: `App.tsx`

**Location:** **REPLACE** the existing file `patient-mobile-app/App.tsx`

**Instructions:**
1. Open the existing `App.tsx` file
2. DELETE all the code in it
3. Copy ALL the code below to replace it (no changes needed)

\`\`\`typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import NavigationScreen from './screens/NavigationScreen';
import FAQScreen from './screens/FAQScreen';
import ContactsScreen from './screens/ContactsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6fb8d5',
        tabBarLabelStyle: { fontSize: 16, fontWeight: '600' },
        tabBarStyle: { height: 80, paddingBottom: 10 },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '🏠 Home' }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ tabBarLabel: '📅 Schedule' }}
      />
      <Tab.Screen
        name="FAQ"
        component={FAQScreen}
        options={{ tabBarLabel: '❓ Help' }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ tabBarLabel: '☎️ Call' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={HomeTabs} />
        <Stack.Screen
          name="Navigation"
          component={NavigationScreen}
          options={{
            headerShown: true,
            title: 'How to Get Home',
            headerStyle: { backgroundColor: '#6fb8d5' },
            headerTintColor: 'white',
            headerTitleStyle: { fontSize: 24, fontWeight: '700' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
\`\`\`

---

## ✅ Step 5: Run the App!

Make sure your backend is still running at http://localhost:5001, then:

\`\`\`bash
npx expo start
\`\`\`

**Options to run:**
- Press **`i`** for iOS Simulator (Mac only)
- Press **`a`** for Android Emulator
- **Scan QR code** with Expo Go app on your phone (easiest!)

### Download Expo Go:
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

---

## 🎯 Test Real-time Sync!

1. **Open your dashboard**: http://localhost:5173
2. **Click "Patient Mobile App" tab**
3. **Add a new FAQ**: "Test question?" → "This is a test answer!"
4. **Watch your phone**: Go to Help tab → New FAQ appears instantly! 🎉
5. **Send urgent message**: Type "Hello!" → Alert pops up on phone!
6. **Edit anything**: All changes sync in real-time!

---

## 🐛 Troubleshooting

### "Can't connect to server"
- ✅ Make sure backend is running: `python backend/main.py`
- ✅ Check IP address in `services/socket.ts` and `services/api.ts`
- ✅ Make sure your phone and computer are on the same WiFi network
- ✅ Test in browser: Open `http://YOUR_IP:5001` - should show `{"status": "ok"}`

### "Module not found" errors
- ✅ Run: `npm install` again
- ✅ Clear cache: `npx expo start -c`

### Changes not syncing
- ✅ Check console logs in the app for connection messages
- ✅ Look for "✅ Connected to server" in app console
- ✅ Check backend terminal for Socket.IO events

---

## 📱 What You Built

A complete mobile app with:
- ✅ Home screen with today's schedule
- ✅ FAQ screen with voice text-to-speech
- ✅ Emergency contacts with one-tap calling  
- ✅ Real-time updates via Socket.IO
- ✅ Large, accessible text (dementia-friendly)
- ✅ Simple navigation (3 taps max to anything)

**Perfect for dementia patients!** 💙

---

## 🎉 Summary

You now have:
1. ✅ Backend running with Socket.IO (port 5001)
2. ✅ Dashboard with admin controls (port 5173)
3. ✅ Mobile app with real-time sync

**Make a change in the dashboard → See it instantly on the phone!**

That's the power of real-time sync! 🚀
