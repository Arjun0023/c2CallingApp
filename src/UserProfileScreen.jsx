// UserProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

const UserProfileScreen = ({ navigation }) => {
  const { setIsAuthenticated } = useContext(AuthContext);
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['access_token', 'userData']);
              setIsAuthenticated(false);
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>
            {userData?.email?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.email}>{userData?.email || 'No email'}</Text>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Organization</Text>
          <Text style={styles.value}>{userData?.tenantName || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{userData?.role || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>SF Status</Text>
          <Text style={styles.value}>{userData?.sfStatus || 'N/A'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarTextLarge: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    padding: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 16,
    color: '#666666',
  },
  value: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 15,
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserProfileScreen;