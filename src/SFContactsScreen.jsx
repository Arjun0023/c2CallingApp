import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SFContactsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>SF Contacts</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SFContactsScreen;
