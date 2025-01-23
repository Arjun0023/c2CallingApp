import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for iOS-style icons
import PhoneScreen from './src/PhoneScreen';
import ContactList from './src/ContactList';
import ContactDetails from './src/ContactDetails';
import Recents from './src/Recents';
import LeadScreen from './src/LeadScreen';
import SFContactsScreen from './src/SFContactsScreen';

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

    switch (activeTab) {
      case 'Phone':
        return <PhoneScreen />;
      case 'Contacts':
        return <ContactList onSelectContact={setSelectedContact} />;
      case 'Recents':
        return <Recents />;
      case 'Lead':
        return <LeadScreen />;
      case 'SF_Contacts':
        return <SFContactsScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.contentContainer}>{renderContent()}</View>
      <View style={styles.tabsContainer}>
        <Tab
          icon="time-outline"
          label="Recents"
          isActive={activeTab === 'Recents'}
          onPress={() => setActiveTab('Recents')}
        />
        <Tab
          icon="call-outline"
          label="Phone"
          isActive={activeTab === 'Phone'}
          onPress={() => setActiveTab('Phone')}
        />
        <Tab
          icon="people-outline"
          label="Contacts"
          isActive={activeTab === 'Contacts'}
          onPress={() => setActiveTab('Contacts')}
        />
        <Tab
          icon="briefcase-outline"
          label="Lead"
          isActive={activeTab === 'Lead'}
          onPress={() => setActiveTab('Lead')}
        />
        <Tab
          icon="person-outline"
          label="SF_Contacts"
          isActive={activeTab === 'SF_Contacts'}
          onPress={() => setActiveTab('SF_Contacts')}
        />
      </View>
    </SafeAreaView>
  );
};

const Tab = ({ icon, label, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.activeTab]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={28}
        color={isActive ? '#007AFF' : '#8E8E93'}
      />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  activeTabText: {
    color: '#007AFF',
  },
});

export default App;
