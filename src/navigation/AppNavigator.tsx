import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';
import { getUserData } from '../utils/storage';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const [loading, setLoading] = React.useState(true);
    const [initialRoute, setInitialRoute] = React.useState<keyof RootStackParamList>('Onboarding');

    React.useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const userData = await getUserData();
        if (userData && userData.onboardingComplete) {
            setInitialRoute('Main');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {initialRoute === 'Onboarding' ? (
                    <>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Main" component={TabNavigator} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} />
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
