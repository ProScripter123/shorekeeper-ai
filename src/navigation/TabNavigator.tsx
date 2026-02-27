import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, Search, Image as ImageIcon, Gamepad2, Settings } from 'lucide-react-native';
import ChatScreen from '../screens/ChatScreen';
import SearchScreen from '../screens/SearchScreen';
import EditImageScreen from '../screens/EditImageScreen';
import GamesScreen from '../screens/GamesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MainTabParamList } from './types';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarBackground: () => (
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                ),
            }}
        >
            <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="EditImage"
                component={EditImageScreen}
                options={{
                    tabBarLabel: 'Edit Image',
                    tabBarIcon: ({ color, size }) => <ImageIcon color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Games"
                component={GamesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Gamepad2 color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        borderTopWidth: 0,
        elevation: 0,
        height: Platform.OS === 'ios' ? 88 : 64,
        backgroundColor: 'transparent',
    },
});
