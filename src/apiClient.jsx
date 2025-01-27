// apiClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://4c59-171-50-200-145.ngrok-free.app';

export const getAuthHeader = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.error('Error getting token:', error);
    return {};
  }
};

export const appendAuthHeader = async (headers = {}) => {
  const authHeader = await getAuthHeader();
  return {
    ...headers,
    ...authHeader,
  };
};