import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import { appendAuthHeader } from '../../utils/auth/apiClient';
import {BASE_URL} from '@env';

const Overlay = ({ visible, onClose, transcription }) => {
  const [selectedOptionType, setSelectedOptionType] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [showTranscription, setShowTranscription] = useState(true);
  const [dropdownExpanded, setDropdownExpanded] = useState(false);
  const BASE_URL = 'https://c2crm.clickto.tech';

  const dropdownOptions = [
    { label: 'Cold Email Outreach', type: 'Cold Email Outreach', icon: 'email' },
    { label: 'Follow-Up', type: 'Follow-Up', icon: 'autorenew' },
    { label: 'Proposal/Information Sharing', type: 'Proposal/Information Sharing', icon: 'insert-drive-file' },
    { label: 'Objection Handling', type: 'Objection Handling', icon: 'handshake' },
    { label: 'Apology/Problem Resolution', type: 'Apology/Problem Resolution', icon: 'mood-bad' },
    { label: 'Closing/Won Deal', type: 'Closing/Won Deal', icon: 'check-circle' },
    { label: 'Closing/Lost Deal', type: 'Closing/Lost Deal', icon: 'cancel' },
    { label: 'Minutes of Meeting', type: 'Minutes of Meeting', icon: 'event-note' },
  ];

  const handleOptionPress = async (option) => {
    setSelectedOptionType(option.type); // Set the selected option
    setShowTranscription(false); // Hide the transcription
    setDropdownExpanded(false); // Minimize dropdown options

    const prefix = `Write an email for ${option.type} using the below notes from the user:`;

    try {
      const headers = await appendAuthHeader({
        'Content-Type': 'application/json',
      });
      const response = await fetch(`${BASE_URL}/convert-to-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paragraph: `${prefix} ${transcription}`,
          object: 'Lead',
          record_id: '00Qak000003Ue9pEAC',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedEmail(data.message); // Set the generated email in the text area
    } catch (error) {
      console.error('Fetch error:', error.message);
      Alert.alert('Error', 'Failed to generate email. Please try again.');
    }
  };

  const handleCopy = () => {
    if (generatedEmail) {
      Clipboard.setString(generatedEmail);
      Alert.alert('Copied', 'Email content copied to clipboard!');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>

          {/* Dropdown Button */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownExpanded(!dropdownExpanded)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedOptionType || 'Select Email Type'}
            </Text>
            <Icon name={dropdownExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color="#007AFF" />
          </TouchableOpacity>

          {/* Dropdown Options */}
          {dropdownExpanded && (
            <View style={styles.dropdownOptionsContainer}>
              {dropdownOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => handleOptionPress(option)}
                >
                  <Icon name={option.icon} size={20} color="#007AFF" />
                  <Text style={styles.dropdownOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Show Transcription or Generated Email */}
          {showTranscription ? (
            <View>
              <Text style={styles.transcriptionTitle}>Transcription</Text>
              <Text style={styles.transcriptionText}>{transcription}</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.transcriptionTitle}>Generated Email</Text>
              <TextInput
                style={styles.textArea}
                multiline={true}
                value={generatedEmail}
                onChangeText={setGeneratedEmail} // Allow editing
              />
              <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                <Icon name="content-copy" size={20} color="#FFF" />
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    minHeight: '85%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  dropdownOptionsContainer: {
    marginTop:10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 1,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
  },
  dropdownOptionText: {
    fontSize: 13,
    marginLeft: 10,
    color: '#333',
  },
  transcriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
    height: 480,
    textAlignVertical: 'top',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  copyButtonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default Overlay;
