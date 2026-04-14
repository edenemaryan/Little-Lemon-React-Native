import React, { useState, useEffect } from 'react';
import { Image, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Onboarding from './screens/Onboarding';
import Profile from './screens/Profile';
import SplashScreen from './screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem('onboardingCompleted');
        if (value !== null) {
          setIsOnboardingCompleted(JSON.parse(value));
        }
      } catch (e) {
        console.error("Error reading storage:", e);
      } finally {
        setTimeout(() => setIsLoading(false), 2000);
      }
    })();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer> 
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: true,
          headerTitleAlign: 'center',
          headerTitle: () => (
            <Image 
              source={require('./assets/images/little-lemon-logo.png')} 
              style={{ width: 150, height: 40, resizeMode: 'contain' }} 
            />
          )
        }}>
        {isOnboardingCompleted ? (
          <Stack.Screen 
            name="Profile" 
            options={{
              headerLeft: () => (
                <View style={{ opacity: 0.3, marginLeft: 10 }}>
                  <Text style={{ fontSize: 30 }}>←</Text> 
                </View>
              ),
            }} 
          >
            {/* Pass the setter function as a prop to handle logout */}
            {(props) => <Profile {...props} setIsOnboardingCompleted={setIsOnboardingCompleted} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <Onboarding 
                {...props} 
                onOnboardingComplete={() => setIsOnboardingCompleted(true)} 
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}