import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
        <Image 
            source={require('../assets/images/little-lemon-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
        />
      <Text style={styles.logoText}>Little Lemon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEFEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,    
    height: 200,  
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#495E57',
  },
});