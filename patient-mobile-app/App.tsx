import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dimensions } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import NavigationScreen from './screens/NavigationScreen';
import FAQScreen from './screens/FAQScreen';
import ContactsScreen from './screens/ContactsScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Match frontend color theme
const COLORS = {
    primary: '#5cc9b1',
    secondary: '#b7a9e1',
    background: '#f8f9fa',
    textDark: '#333333',
    white: '#ffffff',
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
    const tabBarHeight = Math.min(SCREEN_HEIGHT * 0.1, 90);
    const tabBarFontSize = Math.min(SCREEN_WIDTH * 0.04, 18);

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: '#888888',
                tabBarLabelStyle: {
                    fontSize: tabBarFontSize,
                    fontWeight: '600'
                },
                tabBarStyle: {
                    height: tabBarHeight,
                    paddingBottom: SCREEN_HEIGHT * 0.015,
                    paddingTop: SCREEN_HEIGHT * 0.01,
                    backgroundColor: COLORS.white,
                    borderTopWidth: 2,
                    borderTopColor: COLORS.primary,
                },
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
                        headerStyle: { backgroundColor: COLORS.primary },
                        headerTintColor: COLORS.white,
                        headerTitleStyle: {
                            fontSize: Math.min(SCREEN_WIDTH * 0.06, 26),
                            fontWeight: '700'
                        },
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}