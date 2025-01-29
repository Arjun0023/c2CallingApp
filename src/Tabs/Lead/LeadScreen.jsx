import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, TextInput,ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { appendAuthHeader } from '../../utils/auth/apiClient';
import {BASE_URL} from '@env';
//const BASE_URL = 'https://4c59-171-50-200-145.ngrok-free.app'; // Replace with your actual BASE_URL
import { callHandlerService } from './callHandlerService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LeadScreen = ({ navigation }) => {
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
console.log('BASE_URL:', BASE_URL);
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true); // Show loader
        const headers = await appendAuthHeader({
          'Content-Type': 'multipart/form-data',
        });
        const response = await fetch(`${BASE_URL}/salesforce/read`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ object: 'Lead', page: 0, pageSize: 10 }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }

        const data = await response.json();
        setLeads(data.Lead || []);
        setFilteredLeads(data.Lead || []); // Initialize filteredLeads with the fetched data
      } catch (error) {
        console.error('Error fetching leads:', error);
        fetchLeads();
      }
      finally {
        setIsLoading(false); // Hide loader
      }
    };

    fetchLeads();
  }, []);

  // const handleSearch = (query) => {
  //   setSearchQuery(query);
  //   if (query) {
  //     const filtered = leads.filter((lead) =>
  //       `${lead.FirstName} ${lead.LastName}`.toLowerCase().includes(query.toLowerCase())
  //     );
  //     setFilteredLeads(filtered);
  //   } else {
  //     setFilteredLeads(leads);
  //   }
  // };
  const handleSearch = (query) => {
    setSearchQuery(query);
  
    if (query.trim() === '') {
      setFilteredLeads(leads); // Reset to original leads if search is empty
    } else {
      const lowercasedQuery = query.toLowerCase();
      const filtered = leads.filter((lead) =>
        (lead.FirstName && lead.FirstName.toLowerCase().includes(lowercasedQuery)) ||
        (lead.LastName && lead.LastName.toLowerCase().includes(lowercasedQuery)) ||
        (lead.Phone && lead.Phone.toLowerCase().includes(lowercasedQuery)) ||
        (lead.Title && lead.Title.toLowerCase().includes(lowercasedQuery)) ||
        (lead.AccountName && lead.AccountName.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredLeads(filtered);
    }
  };
  const handleCall = async (phone, item) => {
    if (phone) {
      try {
        // Store the name before making the call
        const name = `${item.FirstName} ${item.LastName}`;
        console.log('Storing name for', phone, ':', name);
        await AsyncStorage.setItem(
          `caller_name_${phone}`,
          JSON.stringify({ name, timestamp: Date.now() })
        );
        
        // Make the call
        Linking.openURL(`tel:${phone}`);
      } catch (error) {
        console.error('Error storing name:', error);
      }
    } else {
      alert('Phone number is not available');
    }
  };

  const renderLead = ({ item }) => (
    <View style={styles.card}>
      {/* Name as a touchable link to LeadDetails */}
      <TouchableOpacity
        onPress={() => navigation.navigate('LeadDetailsScreen', { lead: item })}
        style={styles.nameContainer}
      >
        <Text style={styles.name}>{item.FirstName} {item.LastName}</Text>
      </TouchableOpacity>

      {/* Lead Details */}
      <Text style={styles.detail}>Company: {item.Company || 'N/A'}</Text>
      <Text style={styles.detail}>Title: {item.Title || 'N/A'}</Text>
      <Text style={styles.detail}>City: {item.City || 'N/A'}</Text>
      <Text style={styles.detail}>Phone: {item.Phone || 'N/A'}</Text>

      {/* Call Icon */}
      {item.Phone && (
        <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.Phone, item)}>
          <Icon name="call" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Leads..."
          placeholderTextColor="#8e8e93"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Icon name="search" size={24} color="#888" style={styles.searchIcon} />
      </View>

      {isLoading ? (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    ) : filteredLeads.length > 0 ? (
      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item.Id}
        renderItem={renderLead}
        contentContainerStyle={styles.list}
      />
    ) : (
      <Text style={styles.emptyText}>No leads available</Text>
    )}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f2f2f7', // Light grey similar to iOS
  borderRadius: 10,           // Rounded corners
  margin: 12,                 // Slightly tighter margin
  paddingHorizontal: 8,       // Compact horizontal padding
  paddingVertical: 6,         // Compact vertical padding
  shadowColor: '#000',        // Shadow for subtle 3D effect
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,               // Android elevation
},
searchInput: {
  flex: 1,
  fontSize: 14,               // Smaller font size
  color: '#333',              // Dark text color
  paddingVertical: 4,         // Reduced vertical padding
},
searchIcon: {
  marginLeft: 8,
  color: '#8e8e93',           // iOS-like grey for the icon
},
list: {
  padding: 12,                // Consistent padding with compact design
},
emptyText: {
  color: '#8e8e93',           // iOS grey for empty state text
  fontSize: 14,
  textAlign: 'center',
  marginTop: 20,
},
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  nameContainer: {
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  callButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // emptyText: {
  //   textAlign: 'center',
  //   marginTop: 20,
  //   fontSize: 16,
  //   color: '#888',
  // },
});

export default LeadScreen;
