import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { appendAuthHeader } from './apiClient';

const Meetings = ({ navigation }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(null); // To track which file is being transcribed
  const audioRecorderPlayer = new AudioRecorderPlayer();

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      const recordings = files
        .filter((file) => file.name.endsWith('.mp3'))
        .map((file) => ({ name: file.name.split('_')[0], file: file.path }));
      setMeetings(recordings);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch recordings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const transcribeRecording = async (item) => {
    try {
      setTranscribing(item.file); // Set the current transcribing file
      const formData = new FormData();
      formData.append('file', {
        uri: `file://${item.file}`,
        type: 'audio/mpeg',
        name: item.file.split('/').pop(),
      });
      const headers = await appendAuthHeader({
        'Content-Type': 'multipart/form-data',
      });
      const response = await fetch(
        'https://4c59-171-50-200-145.ngrok-free.app/transcribe',
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setMeetings((prevMeetings) =>
        prevMeetings.map((meeting) =>
          meeting.file === item.file
            ? { ...meeting, transcription: result.text }
            : meeting
        )
      );
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert(
        'Error',
        'Failed to transcribe the recording. Please try again.'
      );
    } finally {
      setTranscribing(null); // Clear the transcribing state
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.meetingItem}>
      <View style={styles.meetingInfo}>
        <View style={styles.meetingDetails}>
          <Text style={styles.nameText}>{item.name || 'Unknown Meeting'}</Text>
          <Text style={styles.dateText}>
            Audio File: {item.file.split('/').pop()}
          </Text>
          {item.transcription && (
            <Text style={styles.transcriptionText}>{item.transcription}</Text>
          )}
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={async () => {
              try {
                await audioRecorderPlayer.startPlayer(item.file);
              } catch (error) {
                Alert.alert('Error', 'Failed to play the audio file.');
              }
            }}
          >
            <Ionicons name="play-circle" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.micButton}
            onPress={() => transcribeRecording(item)}
            disabled={transcribing === item.file}
          >
            {transcribing === item.file ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="mic" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meetings</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={meetings}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No meetings recorded yet</Text>
          }
        />
      )}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() =>
          navigation.navigate('RecordMeeting', {
            onAdd: async () => {
              await fetchMeetings();
            },
          })
        }
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#F0F0F5',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    padding: 15,
    color: Platform.OS === 'ios' ? '#000' : '#FFF',
    backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#007AFF',
    textAlign: 'left',
    elevation: 4,
  },
  listContainer: {
    padding: 10,
  },
  meetingItem: {
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
  meetingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetingDetails: {
    flex: 1,
    marginRight: 15,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  playButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  micButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transcriptionText: {
    marginTop: 10,
    fontSize: 14,
    color: '#4A4A4A',
    fontStyle: 'italic',
  },
});

export default Meetings;
