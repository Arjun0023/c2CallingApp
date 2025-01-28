import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Alert,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Animated
} from 'react-native';
import CallLogs from 'react-native-call-log';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import Overlay from './EmailOverlay';
import { appendAuthHeader } from '../../utils/auth/apiClient';
import {BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HEADER_HEIGHT = 10;
const Recents = () => {
  const [callLogs, setCallLogs] = useState([]);
 // console.log(callLogs);
  const [loading, setLoading] = useState({});
  const [transcriptionResponses, setTranscriptionResponses] = useState({});
  const [scrollY] = useState(new Animated.Value(0));
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState('');
  const [displayNames, setDisplayNames] = useState({}); 
  //const BASE_URL = 'https://4c59-171-50-200-145.ngrok-free.app';
  useEffect(() => {
    requestPermissionsAndFetchLogs();
  }, []);

  const requestPermissionsAndFetchLogs = async () => {
    try {
      const permissions = await Promise.all([
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
        ),
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        ),
      ]);

      if (permissions.every(permission => permission === PermissionsAndroid.RESULTS.GRANTED)) {
        const logs = await CallLogs.loadAll();
        setCallLogs(logs);
      } else {
        Alert.alert('Permission Denied', 'Both call log and storage permissions are required.');
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
      Alert.alert('Error', 'Unable to fetch call logs.');
    }
  };

  const formatDateForRecording = (date) => {
    return date.getFullYear() +
           ('0' + (date.getMonth() + 1)).slice(-2) +
           ('0' + date.getDate()).slice(-2) +
           ('0' + date.getHours()).slice(-2) +
           ('0' + date.getMinutes()).slice(-2) +
           ('0' + date.getSeconds()).slice(-2);
  };

const findRecordingFile = async (phoneNumber, timestamp, duration) => {
  const possiblePaths = [
    `${RNFS.ExternalStorageDirectoryPath}/MIUI/sound_recorder/call_rec`,
    `${RNFS.ExternalStorageDirectoryPath}/Recordings/Call`,
    `${RNFS.ExternalStorageDirectoryPath}/Sounds/Recordings`,
    `${RNFS.ExternalStorageDirectoryPath}/Record/Call`,
    `${RNFS.ExternalStorageDirectoryPath}/Recordings/Call`,
      // Add more paths based on your research
      // e.g., `${RNFS.ExternalStorageDirectoryPath}/Samsung/Recordings/Call`
  ];

  for (const recordingsPath of possiblePaths) {
    try {
     if (!(await RNFS.exists(recordingsPath))) {
         continue; // Skip if path doesn't exist
     }
     
      const files = await RNFS.readDir(recordingsPath);
      // Rest of your file searching logic remains the same, just replace the hardcoded path with recordingsPath 
       const callEndTime = new Date(timestamp);
       const callStartTime = new Date(timestamp - (duration * 1000));
       const startTimeStr = formatDateForRecording(callStartTime);
       const cleanNumber = phoneNumber.replace(/\D/g, '');

       const recording = files.find(file => {
         const fileName = file.name;
         if (!fileName.includes(cleanNumber)) {
           return false;
         }
         const fileTimestamp = fileName.match(/_(\d{14})\.mp3$/);
         if (!fileTimestamp) {
           return false;
         }
         const timeDiff = Math.abs(parseInt(fileTimestamp[1]) - parseInt(startTimeStr));
         return timeDiff < 100;
       });
       if(recording) return recording;
    } catch (error) {
        console.error('Error searching in directory:', recordingsPath, error)
    }
  }

  return null; // No recording found in any paths
};

  const transcribeRecording = async (phoneNumber, timestamp, duration, logId) => {
    try {
      setLoading(prev => ({ ...prev, [logId]: true }));

      const recording = await findRecordingFile(phoneNumber, timestamp, duration);
      if (!recording) {
        Alert.alert('File Not Found', 'No recording found for this call.');
        return;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: `file://${recording.path}`,
        type: 'audio/mpeg',
        name: recording.name,
      });

      const headers = await appendAuthHeader({
        'Content-Type': 'multipart/form-data',
      });
  
      const response = await fetch(`${BASE_URL}/transcribe`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      setCallLogs(prev => 
        prev.map(log => 
          log.timestamp === timestamp 
            ? { ...log, transcription: result.text}
            : log
        )
      );

    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe the recording. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [logId]: false }));
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp'
  });


  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) return 'Invalid Date';

    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      });
    }
  };

  useEffect(() => {
    const loadNames = async () => {
      const names = {};
      for (const log of callLogs) {
        // Try to get the stored name for each phone number
        const storedData = await AsyncStorage.getItem(`caller_name_${log.phoneNumber}`);
        if (storedData) {
          const { name } = JSON.parse(storedData);
          names[log.phoneNumber] = name;
        }
      }
      setDisplayNames(names);
    };
  
    loadNames();
  }, [callLogs]);
  const renderItem = ({ item }) =>  {
    // Log what name we're using
    // console.log('Rendering item:', {
    //   phoneNumber: item.phoneNumber,
    //   originalName: item.name,
    //   storedName: displayNames[item.phoneNumber]
    // });

    const displayName = item.name && item.name !== 'Unknown' 
      ? item.name 
      : displayNames[item.phoneNumber] || 'Unknown';

    return (
    <View style={styles.callLogItem}>
      <View style={styles.callInfo}>
        <View style={styles.callDetails}>
          {/* <Text style={styles.nameText}>{item.name || 'Unknown'}</Text> */}
          <Text style={styles.nameText}>{displayName}</Text>
          <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          <Text style={styles.durationText}>Duration: {item.duration}s</Text>
          {item.transcription && (
            <>
            <TouchableOpacity
                style={styles.aiEmailButton}
                onPress={() => {
                  setSelectedTranscription(item.transcription);
                  setOverlayVisible(true);
                }}
              >
                <Text style={styles.aiEmailButtonText}>AI Email</Text>
              </TouchableOpacity>
              <Text style={styles.transcriptionText}>{item.transcription}</Text>
            </>
          )}
        </View>
        <View style={styles.transcribeContainer}>
          <TouchableOpacity
            style={styles.micButton}
            onPress={() =>
              transcribeRecording(item.phoneNumber, item.timestamp, item.duration, item.timestamp)
            }
          >
            {loading[item.timestamp] ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Icon name="mic" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
          <Text style={styles.transcribeLabel}>Transcribe</Text>
        </View>
      </View>
    </View>
  );}
  return (
    <View style={styles.container}>
                 <Overlay
        visible={overlayVisible}
        onClose={() => setOverlayVisible(false)}
        transcription={selectedTranscription}
      />
      <Animated.View 
        style={[
          styles.headerContainer, 
          { transform: [{ translateY: headerTranslate }] }
        ]}
      >
        <Text style={styles.header}>Recent Calls</Text>
      </Animated.View>
      <Animated.FlatList
        contentInsetAdjustmentBehavior="never"
        data={callLogs}
        keyExtractor={item => item.timestamp.toString()}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContainer,
          { paddingTop: HEADER_HEIGHT }
        ]}
        scrollEventThrottle={1}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#F0F0F5',
  },
  headerContainer: {
    backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#007AFF',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    padding: 15,
    color: Platform.OS === 'ios' ? '#000' : '#FFF',
    paddingLeft: 20,
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : undefined,
  },
  listContainer: {
    padding: 10,
  },
  callLogItem: {
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  callInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callDetails: {
    flex: 1,
    marginRight: 15,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : undefined,
    marginBottom: 2,
  },
  phoneNumberText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  durationText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  transcriptionText: {
    marginTop: 8,
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  micButton: {
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 4
  },transcribeLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    textAlign: 'center',
  },
  aiEmailButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  aiEmailButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Recents;