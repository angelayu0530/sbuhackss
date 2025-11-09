import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';

interface ScheduleEvent {
  id: number;
  start_time: string;
  end_time: string;
  location?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [homeData, setHomeData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    // Load initial data
    loadHomeData();
    loadSchedule();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const loadHomeData = async () => {
    try {
      const data = await api.getHomeData();
      setHomeData(data);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const loadSchedule = async () => {
    try {
      const data = await api.getSchedule();
      setSchedule(data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    }
  };

  const handleGoHome = () => {
    Alert.alert(
      'Navigate Home',
      'This would guide you to: ' + (homeData?.home_address || 'your home'),
      [{ text: 'OK' }]
    );
  };

  if (!homeData) {
    return (
      <LinearGradient colors={['#e3f2fd', '#f0f8ff', '#fef9e7']} style={styles.gradientContainer}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#e3f2fd', '#88b9e4ff', '#3b86ffff']}
      style={styles.gradientContainer}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Time */}
        <LinearGradient
          colors={['#dc926fff', '#64b5f6', '#3087e3ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.time}>{currentTime.format('h:mm A')}</Text>
          <Text style={styles.date}>{currentTime.format('dddd, MMMM D')}</Text>
        </LinearGradient>

        {/* Go Home Button */}
        <TouchableOpacity style={styles.goHomeButton} onPress={handleGoHome}>
          <LinearGradient
            colors={['#ce7768ff', '#ee7f5aff', '#dd5b37ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.goHomeGradient}
          >
            <Text style={styles.goHomeIcon}>🏠</Text>
            <Text style={styles.goHomeText}>TAKE ME HOME</Text>
            <Text style={styles.goHomeSubtext}>Tap to navigate & alert caregiver</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Home Address */}
        {homeData.home_address && (
          <View style={styles.addressCard}>
            <Text style={styles.addressLabel}>📍 Home Address:</Text>
            <Text style={styles.addressText}>{homeData.home_address}</Text>
          </View>
        )}

        {/* Today's Schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>📅 Today's Schedule</Text>
          {schedule.length === 0 ? (
            <View style={styles.emptySchedule}>
              <Text style={styles.emptyText}>No events scheduled</Text>
              <Text style={styles.emptySubtext}>Enjoy your free time!</Text>
            </View>
          ) : (
            schedule.map((event, index) => (
              <View key={index} style={styles.eventCard}>
                <View style={styles.eventTime}>
                  <Text style={styles.eventTimeText}>
                    {dayjs(event.start_time).format('h:mm A')}
                  </Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{event.location || 'Event'}</Text>
                  <Text style={styles.eventDuration}>
                    {dayjs(event.start_time).format('h:mm A')} - {dayjs(event.end_time).format('h:mm A')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
} const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 28,
    color: '#5cc9b1',
    fontWeight: '600',
  },
  header: {
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  time: {
    fontSize: 56,
    fontWeight: '800',
    color: 'white',
  },
  date: {
    fontSize: 22,
    color: 'white',
    marginTop: 10,
    fontWeight: '600',
  },
  goHomeButton: {
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  goHomeGradient: {
    padding: 30,
    alignItems: 'center',
  },
  goHomeIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  goHomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  goHomeSubtext: {
    fontSize: 16,
    color: 'white',
    marginTop: 8,
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '600',
  },
  scheduleSection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  emptySchedule: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 18,
    color: '#bbb',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTime: {
    marginRight: 20,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 10,
  },
  eventTimeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5cc9b1',
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  eventDuration: {
    fontSize: 18,
    color: '#666',
  },
});
