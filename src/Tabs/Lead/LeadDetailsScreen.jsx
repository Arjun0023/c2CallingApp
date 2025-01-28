import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const formatValue = (value) => {
  // Handle different types of values
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'object') {
    // If it's an object, try to get a string representation
    if (value.Name) return value.Name;
    return JSON.stringify(value);
  }
  return String(value);
};

const LeadDetailsScreen = ({ route }) => {
  const { lead } = route.params;

  return (
    <ScrollView style={styles.container}>
      {Object.entries(lead).map(([key, value]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.key}>{key}:</Text>
          <Text style={styles.value}>{formatValue(value)}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Light blue-grey theme
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // Subtle divider color
  },
  key: {
    fontWeight: '600', // iOS-style bold
    fontSize: 16,
    color: '#000', // Black text
    width: 140, // Slightly increased width for alignment
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#000', // Black text
  },
});

export default LeadDetailsScreen;
