// ContactList.jsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, PermissionsAndroid } from 'react-native';
import Contacts from 'react-native-contacts';

const ContactList = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      );

      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        Contacts.getAll().then(setContacts);
      } else {
        console.log('Permission to access contacts was denied');
      }
    };

    fetchContacts();
  }, []);

  return (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item.recordID}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => onSelectContact(item)}
        >
          <Text style={styles.contactName}>{item.displayName}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  contactItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  contactName: {
    fontSize: 18,
  },
});

export default ContactList;
