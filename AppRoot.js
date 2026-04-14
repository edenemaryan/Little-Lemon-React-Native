import React, { useState, useEffect } from 'react';
import { Image, View, Text, Pressable, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screen Imports
import Onboarding from './screens/Onboarding';
import Profile from './screens/Profile';
import Home from './screens/Home';
import SplashScreen from './screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    image: null,
  });

  // Load initial app state and user data
  useEffect(() => {
    const prepareApp = async () => {
      try {
        const [onboardingValue, firstName, lastName, image] = await Promise.all([
          AsyncStorage.getItem('onboardingCompleted'),
          AsyncStorage.getItem('firstName'),
          AsyncStorage.getItem('lastName'),
          AsyncStorage.getItem('image'),
        ]);

        if (onboardingValue !== null) {
          setIsOnboardingCompleted(JSON.parse(onboardingValue));
        }

        setProfileData({
          firstName: firstName || '',
          lastName: lastName || '',
          image: image || null,
        });
      } catch (e) {
        console.error("Failed to load initial data:", e);
      } finally {
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    prepareApp();
  }, [isOnboardingCompleted]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerShown: true,
          headerTitleAlign: 'center',
          headerTitle: () => (
            <Image 
              source={require('./assets/images/little-lemon-logo.png')} 
              style={styles.logo} 
            />
          ),
          // Dynamic Avatar for the Right side
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatarContainer}>
              {profileData.image ? (
                <Image source={{ uri: profileData.image }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {`${profileData.firstName[0] || ''}${profileData.lastName[0] || ''}`.toUpperCase() || 'LL'}
                  </Text>
                </View>
              )}
            </Pressable>
          ),
        })}
      >
        {isOnboardingCompleted ? (
          <>
            <Stack.Screen 
              name="Home" 
              component={Home} 
              options={{ headerLeft: () => null }} 
            />
            <Stack.Screen name="Profile">
              {(props) => (
                <Profile 
                  {...props} 
                  setIsOnboardingCompleted={setIsOnboardingCompleted} 
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen 
            name="Onboarding" 
            options={{ headerShown: false }}
          >
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

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 40,
    resizeMode: 'contain',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#495E57',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});