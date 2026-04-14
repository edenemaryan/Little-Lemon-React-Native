import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Onboarding = ({ onOnboardingComplete }) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  // Validation Logic
  const isFirstNameValid = firstName.length > 0 && /^[a-zA-Z]+$/.test(firstName);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isFirstNameValid && isEmailValid;

  const handleNext = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', JSON.stringify(true));
      await AsyncStorage.setItem('userFirstName', firstName);
      await AsyncStorage.setItem('userEmail', email);
      onOnboardingComplete(); 
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Step 2: Header with Logo */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/little-lemon-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>Little Lemon</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Let us get to know you</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          disabled={!isFormValid}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDEFEE' },
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dee3e1',
    paddingTop: 40,
  },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#495E57' },
  logo: { width: 40, height: 40, marginLeft: 10 },
  content: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, color: '#495E57', marginBottom: 60 },
  inputContainer: { width: '100%' },
  label: { fontSize: 20, color: '#495E57', marginBottom: 5, textAlign: 'center' },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: '#495E57',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 18,
    marginBottom: 30,
  },
  footer: { padding: 40, backgroundColor: '#F1F1F1', alignItems: 'flex-end' },
  button: {
    backgroundColor: '#495E57',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: 'white', fontSize: 20 },
});

export default Onboarding;