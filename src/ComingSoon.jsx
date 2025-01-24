import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ComingSoon = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Coming Soon...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  text: {
    fontSize: 18,
    color: 'gray',
  },
});

export default ComingSoon;
