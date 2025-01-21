// PhoneScreen.jsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Linking,Text } from 'react-native';

const PhoneScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCall = () => {
    if (!phoneNumber) {
      Alert.alert('Invalid Input', 'Please enter a valid phone number.');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={styles.callButton} onPress={handleCall}>
        <Text style={styles.callButtonText}>Call</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 18,
    backgroundColor: '#FFFFFF',
  },
  callButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PhoneScreen;