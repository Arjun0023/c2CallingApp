import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const RecordMeeting = ({ route, navigation }) => {
  const [meetingName, setMeetingName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        if (
          granted['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.READ_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert('Permissions Denied', 'You need to allow permissions to record audio.');
          return false;
        }
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleStartRecording = async () => {
    if (!meetingName.trim()) {
      Alert.alert('Error', 'Please enter a meeting name.');
      return;
    }
  
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
  
    setIsRecording(true);
    const fileName = `${meetingName.replace(/\s+/g, '_')}_${Date.now()}.mp3`;
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  
    await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener((e) => {
      const currentPositionInSec = Math.floor(e.currentPosition / 1000);
      const hours = Math.floor(currentPositionInSec / 3600);
      const minutes = Math.floor((currentPositionInSec % 3600) / 60);
      const seconds = currentPositionInSec % 60;
  
      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setRecordTime(formattedTime);
      return;
    });
  };

  const handleStopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);

    route.params.onAdd({ name: meetingName, file: result });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Meeting Name:</Text>
      <TextInput
        style={styles.input}
        value={meetingName}
        onChangeText={setMeetingName}
        placeholder="Enter meeting name"
      />
      <Text style={styles.timerText}>{recordTime}</Text>
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recording]}
        onPress={isRecording ? handleStopRecording : handleStartRecording}
      >
        <Ionicons name={isRecording ? 'stop' : 'mic'} size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    width: '80%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  recordButton: {
    backgroundColor: '#007AFF',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    backgroundColor: 'red',
  },
});

export default RecordMeeting;
