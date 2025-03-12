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
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
// import {BASE_URL} from '@env';
//const BASE_URL = 'https://4c59-171-50-200-145.ngrok-free.app';
const BASE_URL = 'https://c2crm.clickto.tech';
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
      console.log('Attempting to sign in with URL:', BASE_URL);
      
      const formData = {
        grant_type: 'password',
        username: email,
        password: password,
        scope: '',
        client_id: '',
        client_secret: '',
        tenant_name: orgName,
      };
      
      // Using axios instead of fetch
      const response = await axios.post(`${BASE_URL}/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Converting the object to x-www-form-urlencoded format
        transformRequest: [(data) => {
          return Object.entries(data)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        }]
      });

      // Axios automatically returns the data property
      const data = response.data;
      console.log('Sign-in response:', data);
      
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
    } catch (error) {
      console.error('SignIn Error:', error);
      
      // Improved error handling with axios
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 401) {
          setError('Email or password is incorrect');
        } else {
          setError(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Error message:', error.message);
        setError('An error occurred. Please try again.');
      }
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
  buttonDisabled: {
    backgroundColor: '#80B7EE', // Lighter blue when disabled
  },
  errorText: {
    color: '#E74C3C',
    marginTop: 5,
    marginBottom: 15,
    fontSize: 14,
  },
  signUpText: {
    marginTop: 15,
    fontSize: 16,
    color: '#006FDD',
    fontWeight: '500',
  },
});

export default SignInScreen;