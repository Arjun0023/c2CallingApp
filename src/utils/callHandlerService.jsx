import { PermissionsAndroid } from 'react-native';
import CallLogs from 'react-native-call-log';
import AsyncStorage from '@react-native-async-storage/async-storage';

class CallHandlerService {
  constructor() {
    this.nameMapping = new Map(); // Store phone number to name mappings
  }

  // Store the name mapping before making a call
  async registerCall(phoneNumber, name) {
    try {
      // Check if this number exists in the call log with a saved name
      const logs = await CallLogs.load(1); // Get most recent logs
      const existingLog = logs.find(log => log.phoneNumber === phoneNumber);
      
      // Only store our mapping if the number isn't already saved in contacts
      if (!existingLog || existingLog.name === 'Unknown' || !existingLog.name) {
        await AsyncStorage.setItem(
          `caller_name_${phoneNumber}`,
          JSON.stringify({ name, timestamp: Date.now() })
        );
        
        // Remove the mapping after 1 hour
        setTimeout(async () => {
          await AsyncStorage.removeItem(`caller_name_${phoneNumber}`);
        }, 3600000); // 1 hour
      }
    } catch (error) {
      console.error('Error registering call:', error);
    }
  }


  // Get the stored name for a phone number
  getStoredName(phoneNumber) {
    return this.nameMapping.get(phoneNumber);
  }

  // Handle making the call and updating the log
  async handleCall(phoneNumber, name, type = 'unknown') {
    try {
      // Register the name mapping
      this.registerCall(phoneNumber, name);
      
      // Make the call
      const url = `tel:${phoneNumber}`;
      Linking.openURL(url);
      
      // Wait for call to be logged (approximate timing)
      setTimeout(async () => {
        await this.updateRecentCallName(phoneNumber, name, type);
      }, 2000);
      
    } catch (error) {
      console.error('Error handling call:', error);
    }
  }

  // Update the name in call logs
  async updateRecentCallName(phoneNumber, name, type) {
    try {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
      );

      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        // Get most recent call log
        const logs = await CallLogs.load(1);
        const recentCall = logs[0];

        // Verify this is the call we just made
        if (recentCall && recentCall.phoneNumber === phoneNumber) {
          // Store the name mapping in AsyncStorage for persistence
          await AsyncStorage.setItem(
            `call_name_${recentCall.timestamp}`,
            JSON.stringify({
              name,
              type,
              phoneNumber
            })
          );
        }
      }
    } catch (error) {
      console.error('Error updating call name:', error);
    }
  }
}

export const callHandlerService = new CallHandlerService();