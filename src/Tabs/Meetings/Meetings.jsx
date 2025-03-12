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
  Modal,
  TouchableWithoutFeedback,
  PermissionsAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { appendAuthHeader } from '../../utils/auth/apiClient';
import {BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserAvatar from '../../components/UserAvatar';
import DocumentPicker from 'react-native-document-picker';
import { useFocusEffect } from '@react-navigation/native';

const Meetings = ({ navigation }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(null); // To track which file is being transcribed
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCallRecording, setNewCallRecording] = useState(null);
  const [newCallRecordingModal, setNewCallRecordingModal] = useState(false);
  const audioRecorderPlayer = new AudioRecorderPlayer();
  const [userEmail, setUserEmail] = useState('');
  const BASE_URL = 'https://devbrain.clickto.tech';
  
  // Directories to check for call recordings
  const directoriesToCheck = [
    RNFS.DownloadDirectoryPath,
    `${RNFS.ExternalStorageDirectoryPath}/Recordings/Call`
  ];

  // Audio file extensions to look for
  const audioExtensions = ['.mp3', '.m4a', '.aac', '.wav', '.ogg'];

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

  const requestExternalStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (parseInt(Platform.Version, 10) >= 33) {
          return true; // For Android 13+ (API 33+), we use newer scoped storage APIs
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to your storage to check for call recordings.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  const extractInfoFromFilename = (filename) => {
    // Extract information from filename - this is a basic implementation
    // You may need to adjust this based on your actual filename format
    try {
      // Attempt to extract phone number/contact name and timestamp
      const parts = filename.split('_');
      
      // This is a simple guess at the format - adjust as needed
      let contactInfo = 'Unknown';
      let timestamp = new Date().toLocaleString();
      
      // If filename has at least 2 parts
      if (parts.length >= 2) {
        contactInfo = parts[0].replace(/[^a-zA-Z0-9+]/g, ''); // Clean up contact info
        
        // Try to extract date/time from filename
        const dateMatch = filename.match(/(\d{4}[-\d]+)/); // Look for date patterns
        if (dateMatch) {
          // Convert found date string to a readable format
          const dateStr = dateMatch[1];
          const date = new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3 $4:$5'));
          if (!isNaN(date.getTime())) {
            timestamp = date.toLocaleString();
          }
        }
      }
      
      return {
        contact: contactInfo,
        timestamp: timestamp
      };
    } catch (error) {
      console.error('Error parsing filename:', error);
      return {
        contact: 'Unknown',
        timestamp: new Date().toLocaleString()
      };
    }
  };

  const checkForLatestCallRecording = async () => {
    try {
      const hasPermission = await requestExternalStoragePermission();
      if (!hasPermission) {
        console.log('Storage permission denied');
        return;
      }
      
      // Get the last shown recording to avoid showing the same one
      const lastShownRecording = await AsyncStorage.getItem('lastShownCallRecording');
      
      let latestFile = null;
      let latestTime = 0;
      
      // Check all directories for the latest file
      for (const directory of directoriesToCheck) {
        try {
          // Check if directory exists
          const dirExists = await RNFS.exists(directory);
          if (!dirExists) continue;
          
          const files = await RNFS.readDir(directory);
          
          // Get the latest audio file
          for (const file of files) {
            const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (audioExtensions.includes(fileExt)) {
              const stats = await RNFS.stat(file.path);
              
              if (stats.mtime > latestTime) {
                latestTime = stats.mtime;
                latestFile = file;
              }
            }
          }
        } catch (error) {
          console.error(`Error reading directory ${directory}:`, error);
        }
      }
      
      // If we found a file and it's different from the last shown one
      if (latestFile && latestFile.path !== lastShownRecording) {
        const fileInfo = extractInfoFromFilename(latestFile.name);
        
        // Set the new recording info and show the modal
        setNewCallRecording({
          path: latestFile.path,
          name: latestFile.name,
          contact: fileInfo.contact,
          timestamp: fileInfo.timestamp
        });
        setNewCallRecordingModal(true);
        
        // Update the last shown recording
        await AsyncStorage.setItem('lastShownCallRecording', latestFile.path);
      }
    } catch (error) {
      console.error('Error checking for latest call recording:', error);
    }
  };

  const uploadCallRecording = async (file) => {
    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: `file://${file.path}`,
        type: getAudioMimeType(file.name),
        name: file.name,
      });
      
      // Add metadata if available
      if (file.contact) {
        formData.append('contact', file.contact);
      }
      if (file.timestamp) {
        formData.append('timestamp', file.timestamp);
      }
      
      // Make API call with proper headers
      const headers = await appendAuthHeader({
        'Content-Type': 'multipart/form-data',
      });
      
      const response = await fetch(
        `${BASE_URL}/upload-audio-and-store`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }
      
      const responseData = await response.json();
      
      // Show success message
      Alert.alert('Success', 'Call recording uploaded successfully.');
      
      // Refresh the meetings list
      await fetchMeetings();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', `Failed to upload call recording: ${error.message}`);
    } finally {
      setUploading(false);
      setNewCallRecordingModal(false);
    }
  };

  // Get MIME type based on file extension
  const getAudioMimeType = (filename) => {
    const extension = filename.toLowerCase().split('.').pop();
    const mimeTypes = {
      'mp3': 'audio/mpeg',
      'm4a': 'audio/mp4',
      'aac': 'audio/aac',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg'
    };
    
    return mimeTypes[extension] || 'audio/mpeg'; // Default to audio/mpeg if unknown
  };

  // Dismiss the new recording prompt
  const dismissNewRecordingPrompt = () => {
    setNewCallRecordingModal(false);
  };

  useEffect(() => {
    fetchMeetings();
    loadUserEmail();
    
    // Initial check for latest call recording
    checkForLatestCallRecording();
    
    // Set up periodic checks (every 30 seconds)
    const checkInterval = setInterval(checkForLatestCallRecording, 30000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, []);
  
  // Also check for new recordings when the component gets focus
  useFocusEffect(
    React.useCallback(() => {
      checkForLatestCallRecording();
    }, [])
  );

  const loadUserEmail = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserEmail(userData.email);
      }
    } catch (error) {
      console.error('Error loading user email:', error);
    }
  };

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
        `${BASE_URL}/transcribe`,
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

  const handleUploadAudio = async () => {
    try {
      setUploading(true);
      
      // Pick an audio document with explicit support for multiple audio formats
      const result = await DocumentPicker.pick({
        type: [
          'audio/mpeg',           // MP3
          'audio/mp4',            // M4A, AAC
          'audio/x-m4a',          // M4A (alternative MIME type)
          'audio/aac',            // AAC
          'audio/wav',            // WAV
          'audio/ogg',            // OGG
          'audio/webm',           // WEBM
          DocumentPicker.types.audio, // Fallback for other audio types
        ],
        copyTo: 'documentDirectory',
      });
  
      const file = result[0];
      
      if (!file) {
        throw new Error('No file selected');
      }
  
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: file.fileCopyUri || file.uri,
        type: file.type || 'audio/mpeg', // Fallback type if not provided
        name: file.name,
      });
  
      // Make API call with proper headers
      const headers = await appendAuthHeader({
        'Content-Type': 'multipart/form-data',
      });
      
      const response = await fetch(
        `${BASE_URL}/upload-audio-and-store`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }
  
      const responseData = await response.json();
      
      // Show success message with some details from the response
      Alert.alert(
        'Success', 
        `Audio file uploaded and transcribed successfully.`
      );
      
      // Refresh the meetings list
      await fetchMeetings();
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('Document picker cancelled');
      } else {
        console.error('Upload error:', error);
        Alert.alert('Error', `Failed to upload audio file: ${error.message}`);
      }
    } finally {
      setUploading(false);
      setOptionsModalVisible(false);
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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Meetings</Text>
        <UserAvatar 
          email={userEmail}
          onPress={() => navigation.navigate('UserProfile')}
        />
      </View>
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
        onPress={() => setOptionsModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOptionsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Choose an option</Text>
                
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={() => {
                    setOptionsModalVisible(false);
                    navigation.navigate('RecordMeeting', {
                      onAdd: async () => {
                        await fetchMeetings();
                      },
                    });
                  }}
                >
                  <Ionicons name="mic-outline" size={24} color="#007AFF" />
                  <Text style={styles.modalOptionText}>Record Meeting</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={handleUploadAudio}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
                  )}
                  <Text style={styles.modalOptionText}>
                    {uploading ? 'Uploading...' : 'Upload Audio'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalOption, styles.cancelOption]}
                  onPress={() => setOptionsModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* New Call Recording Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={newCallRecordingModal}
        onRequestClose={dismissNewRecordingPrompt}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Call Recording Detected</Text>
            
            {newCallRecording && (
              <View style={styles.callInfoContainer}>
                <Text style={styles.callInfoText}>
                  <Text style={styles.callInfoLabel}>Call with: </Text>
                  {newCallRecording.contact || 'Unknown'}
                </Text>
                <Text style={styles.callInfoText}>
                  <Text style={styles.callInfoLabel}>Date/Time: </Text>
                  {newCallRecording.timestamp}
                </Text>
                <Text style={styles.callInfoText}>
                  <Text style={styles.callInfoLabel}>File: </Text>
                  {newCallRecording.name}
                </Text>
              </View>
            )}
            
            <Text style={styles.callPromptText}>
              Would you like to upload this call recording?
            </Text>
            
            <View style={styles.callModalButtons}>
              <TouchableOpacity 
                style={[styles.callModalButton, styles.callModalButtonSecondary]}
                onPress={dismissNewRecordingPrompt}
              >
                <Text style={styles.callModalButtonTextSecondary}>No</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.callModalButton, styles.callModalButtonPrimary]}
                onPress={() => newCallRecording && uploadCallRecording(newCallRecording)}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.callModalButtonTextPrimary}>Yes, Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#F0F0F5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#007AFF',
    elevation: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: Platform.OS === 'ios' ? '#000' : '#FFF',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  callInfoContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  callInfoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  callInfoLabel: {
    fontWeight: 'bold',
  },
  callPromptText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  callModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  callModalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  callModalButtonSecondary: {
    backgroundColor: '#F2F2F2',
  },
  callModalButtonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  callModalButtonTextSecondary: {
    color: '#666666',
  }
});

export default Meetings;