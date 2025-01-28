import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { appendAuthHeader } from '../../utils/auth/apiClient';
//const BASE_URL = 'https://4c59-171-50-200-145.ngrok-free.app'; // Replace with your actual BASE_URL
import {BASE_URL} from '@env';

const TasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const headers = await appendAuthHeader({
          'Content-Type': 'application/json',
        });
  
        const response = await fetch(`${BASE_URL}/salesforce/read`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ object: 'Task', page: 0, pageSize: 10 }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data.Task || []);
        setFilteredTasks(data.Task || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const lowercasedQuery = query.toLowerCase();
      const filtered = tasks.filter((task) =>
        (task.Subject && task.Subject.toLowerCase().includes(lowercasedQuery)) ||
        (task.Status && task.Status.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredTasks(filtered);
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.Subject}</Text>
      <Text style={styles.detail}>Status: {item.Status || 'N/A'}</Text>
      <Text style={styles.detail}>Activity Date: {item.ActivityDate || 'N/A'}</Text>
      <Text style={styles.detail}>Priority: {item.Priority || 'N/A'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Tasks..."
          placeholderTextColor="#8e8e93"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Icon name="search" size={24} color="#888" style={styles.searchIcon} />
      </View>

      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.Id}
          renderItem={renderTask}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>No tasks available</Text>
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
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    margin: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 4,
  },
  searchIcon: {
    marginLeft: 8,
    color: '#8e8e93',
  },
  list: {
    padding: 12,
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  emptyText: {
    color: '#8e8e93',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TasksScreen;
