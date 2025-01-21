// App.jsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import PhoneScreen from './PhoneScreen';
import ContactList from './ContactList';
import ContactDetails from './ContactDetails';

const App = () => {
  const [activeTab, setActiveTab] = useState('Phone');
  const [selectedContact, setSelectedContact] = useState(null);

  const renderContent = () => {
    if (selectedContact) {
      return (
        <ContactDetails
          contact={selectedContact}
          onBack={() => setSelectedContact(null)}
        />
      );
    }

    return activeTab === 'Phone' ? (
      <PhoneScreen />
    ) : (
      <ContactList onSelectContact={setSelectedContact} />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'Phone' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('Phone')}
        >
          <Text style={styles.tabText}>Phone</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'Contacts' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('Contacts')}
        >
          <Text style={styles.tabText}>Contacts</Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  tab: {
    paddingVertical: 15,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default App;