import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import qs from 'qs';
import { useNavigation } from '@react-navigation/native';
import {BASE_URL} from '@env';
//const BASE_URL = 'https://4c59-171-50-200-145.ngrok-free.app';

const SignInScreen = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

  const handleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      setLoading(true);
      const formData = qs.stringify({
        grant_type: 'password',
        username: email,
        password: password,
        scope: '',
        client_id: '',
        client_secret: '',
        tenant_name: orgName,
      });


      // Explicitly check the formData is non-empty
      if (!formData) {
        throw new Error('FormData is empty');
      }
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        await AsyncStorage.setItem('access_token', data.access_token);
        
        // Store additional user data
        const userData = JSON.stringify({
          email,
          role: data.role,
          sfStatus: data.status,
          tenantName: orgName
        });
        await AsyncStorage.setItem('userData', userData);

        if (data.status === "sf login needed") {
          setError('Please integrate Salesforce first');
        } else {
          // Add this line to trigger a state update
            onSignIn();
             //Remove this line navigation.navigate('Main');
        }
      } else {
        setError('Email or password is incorrect');
      }
    } catch (error) {
      console.error('SignIn Error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* <Image
        source={require('../assets/logo.png')} // Make sure to add your logo
        style={styles.logo}
      /> */}

      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email ID"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#B0B0B0"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Organization Name"
        value={orgName}
        onChangeText={setOrgName}
        autoCapitalize="none"
        placeholderTextColor="#B0B0B0"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#B0B0B0"
        editable={!loading}
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f9', // Light grey background
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    width: '100%',
    borderRadius: 25,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#2C3E50',
  },
  button: {
    width: '100%',
    backgroundColor: '#006FDD', // Salesforce-like blue
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedback: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  signUpText: {
    marginTop: 15,
    fontSize: 16,
    color: '#006FDD',
    fontWeight: '500',
  },
});

export default SignInScreen;
