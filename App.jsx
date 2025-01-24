import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for tab icons
import PhoneScreen from './src/PhoneScreen';
import ContactList from './src/ContactList';
import ContactDetails from './src/ContactDetails';
import LeadDetailsScreen from './src/LeadDetailsScreen';
import Recents from './src/Recents';
import LeadScreen from './src/LeadScreen';
import SFContactsScreen from './src/SFContactsScreen';


const LeadStack = createStackNavigator();
const LeadStackScreen = () => (
  <LeadStack.Navigator>
    <LeadStack.Screen name="Leads" component={LeadScreen} options={{ headerShown: false }}  />
    <LeadStack.Screen name="LeadDetailsScreen" component={LeadDetailsScreen} />
  </LeadStack.Navigator>
);

// Main Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Recents') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Phone') {
              iconName = focused ? 'call' : 'call-outline';
            } else if (route.name === 'Contacts') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Lead') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'SFContacts') {
              iconName = focused ? 'person' : 'person-outline';
            }

            // Return the icon
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Recents" component={Recents} />
        <Tab.Screen name="Phone" component={PhoneScreen} />
        {/* <Tab.Screen name="Contacts" component={ContactStackScreen} /> */}
        <Tab.Screen name="Lead" component={LeadStackScreen} />
        <Tab.Screen name="SFContacts" component={SFContactsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
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
