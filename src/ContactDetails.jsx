// ContactDetails.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ContactDetails = ({ contact, onBack }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{contact.name}</Text>
      <Text style={styles.subtitle}>{contact.phoneNumbers[0]?.number || 'No number available'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555555',
  },
});

export default ContactDetails;
