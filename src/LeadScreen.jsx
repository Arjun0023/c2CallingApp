import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BASE_URL = 'https://e8f9-122-170-233-218.ngrok-free.app'; // Replace with your actual BASE_URL
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZW9AYzIudGVjaCIsInJvbGUiOiJleGVjdXRpdmUiLCJleHAiOjE3Mzc2ODk4NDF9.CIJd_3OAs8SHv4EoEdqCC2MiXEq7VB7qPD4FuEZhhRU'; // Replace with your actual token

const LeadScreen = () => {
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const tab = 'Lead';
        const page = 0;
        const pageSize = 10;

        const response = await fetch(`${BASE_URL}/salesforce/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ object: tab, page, pageSize }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }

        const data = await response.json();
        console.log('Leads data:', data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    fetchLeads();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lead</Text>
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

export default LeadScreen;
