// UserAvatar.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const UserAvatar = ({ email, onPress }) => {
  const getInitials = (email) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  };

  return (
    <TouchableOpacity style={styles.avatarContainer} onPress={onPress}>
      <Text style={styles.avatarText}>{getInitials(email)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2, // Added border width
    borderColor: '#FFFFFF', // Added white border color
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserAvatar;
