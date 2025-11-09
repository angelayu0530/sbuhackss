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