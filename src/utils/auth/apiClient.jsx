// apiClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';


export const getAuthHeader = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    console.log('Access Token:', token);
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