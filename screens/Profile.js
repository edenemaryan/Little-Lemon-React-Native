import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, ScrollView, 
  Pressable, Image, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { MaskedTextInput } from "react-native-mask-text";

const Profile = ({ navigation, setIsOnboardingCompleted }) => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    orderStatuses: false,
    passwordChanges: false,
    specialOffers: false,
    newsletter: false,
    image: null,
  });

  // Step 1: Automatic data transfer from Onboarding
  useEffect(() => {
    (async () => {
      try {
        const savedData = await AsyncStorage.multiGet([
          'firstName', 'email', 'lastName', 'phoneNumber', 
          'orderStatuses', 'passwordChanges', 'specialOffers', 'newsletter', 'image'
        ]);
        
        const initialState = {};
        savedData.forEach(([key, value]) => {
          if (value !== null) {
            // Handle booleans for checkboxes
            if (['orderStatuses', 'passwordChanges', 'specialOffers', 'newsletter'].includes(key)) {
              initialState[key] = value === 'true';
            } else {
              initialState[key] = value;
            }
          }
        });

        setProfile(prev => ({ ...prev, ...initialState }));
      } catch (e) {
        console.error("Failed to load profile data", e);
      }
    })();
  }, []);

  // Step 4: Profile Image Picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfile({ ...profile, image: result.assets[0].uri });
    }
  };

  const removeImage = () => setProfile({ ...profile, image: null });

  // Step 6: Persist changes
  const saveChanges = async () => {
    try {
      const entries = Object.entries(profile).map(([key, value]) => [key, String(value)]);
      await AsyncStorage.multiSet(entries);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (e) {
      console.error(e);
    }
  };

  const discardChanges = () => {
    // In a real app, you'd re-fetch from AsyncStorage here
    Alert.alert("Discarded", "Changes have been reverted.");
  };

  // Step 7: Logging out
  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsOnboardingCompleted(false); // Sends user back to Onboarding
  };

  const renderAvatar = () => {
    if (profile.image) {
      return <Image source={{ uri: profile.image }} style={styles.avatar} />;
    }
    const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase();
    return (
      <View style={[styles.avatar, styles.avatarPlaceholder]}>
        <Text style={styles.avatarText}>{initials || 'LL'}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <Text style={styles.label}>Avatar</Text>
      <View style={styles.avatarContainer}>
        {renderAvatar()}
        <Pressable style={styles.btnGreen} onPress={pickImage}>
          <Text style={styles.btnText}>Change</Text>
        </Pressable>
        <Pressable style={styles.btnWhite} onPress={removeImage}>
          <Text style={styles.btnTextDark}>Remove</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>First Name</Text>
      <TextInput 
        style={styles.input} 
        value={profile.firstName} 
        onChangeText={t => setProfile({...profile, firstName: t})} 
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput 
        style={styles.input} 
        value={profile.lastName} 
        onChangeText={t => setProfile({...profile, lastName: t})} 
      />

      <Text style={styles.label}>Email</Text>
      <TextInput 
        style={styles.input} 
        value={profile.email} 
        keyboardType="email-address"
        onChangeText={t => setProfile({...profile, email: t})} 
      />

      <Text style={styles.label}>Phone Number</Text>
      <MaskedTextInput
        mask="(999) 999-9999"
        style={styles.input}
        value={profile.phoneNumber}
        onChangeText={t => setProfile({...profile, phoneNumber: t})}
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Email Notifications</Text>
      {['Order Statuses', 'Password changes', 'Special offers', 'Newsletter'].map((item) => (
        <View key={item} style={styles.checkboxRow}>
          <Text>{item}</Text>
          {/* Using a Pressable as a cosmetic checkbox */}
          <Pressable 
            onPress={() => {
              const key = item.charAt(0).toLowerCase() + item.slice(1).replace(' ', '');
              setProfile({...profile, [key]: !profile[key]});
            }}
            style={[styles.checkbox, profile[item.charAt(0).toLowerCase() + item.slice(1).replace(' ', '')] && styles.checked]}
          />
        </View>
      ))}

      <Pressable style={styles.btnLogout} onPress={handleLogout}>
        <Text style={styles.btnLogoutText}>Log out</Text>
      </Pressable>

      <View style={styles.footer}>
        <Pressable style={styles.btnWhite} onPress={discardChanges}>
          <Text style={styles.btnTextDark}>Discard changes</Text>
        </Pressable>
        <Pressable style={styles.btnGreen} onPress={saveChanges}>
          <Text style={styles.btnText}>Save changes</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
  label: { fontSize: 12, color: '#495E57', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  avatarContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 15 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { backgroundColor: '#495E57', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  btnGreen: { backgroundColor: '#495E57', padding: 10, borderRadius: 8 },
  btnWhite: { borderWidth: 1, borderColor: '#495E57', padding: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  btnTextDark: { color: '#495E57', fontWeight: 'bold' },
  checkboxRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#495E57', borderRadius: 4 },
  checked: { backgroundColor: '#495E57' },
  btnLogout: { backgroundColor: '#F4CE14', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnLogoutText: { fontWeight: 'bold', color: '#333' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 30 },
});

export default Profile;