import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const LeadDetailsScreen = ({ route }) => {
  const { lead } = route.params;

  return (
    <ScrollView style={styles.container}>
      {Object.entries(lead).map(([key, value]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.key}>{key}:</Text>
          <Text style={styles.value}>{value || 'N/A'}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  key: {
    fontWeight: 'bold',
    width: 120,
  },
  value: {
    flex: 1,
  },
});

export default LeadDetailsScreen;
