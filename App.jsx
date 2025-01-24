import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for tab icons
import PhoneScreen from './src/PhoneScreen';
import LeadDetailsScreen from './src/LeadDetailsScreen';
import Recents from './src/Recents';
import LeadScreen from './src/LeadScreen';
import SFContactsScreen from './src/SFContactsScreen';
import ContactDetailsScreen from './src/ContactDetailsScreen';
import TasksScreen from './src/TasksScreen';

const LeadStack = createStackNavigator();
const LeadStackScreen = () => (
  <LeadStack.Navigator>
    <LeadStack.Screen name="Leads" component={LeadScreen} options={{ headerShown: false }}  />
    <LeadStack.Screen name="LeadDetailsScreen" component={LeadDetailsScreen} />
  </LeadStack.Navigator>
);
const SFContactStack = createStackNavigator();
const SFContactStackScreen = () => (
  <SFContactStack.Navigator>
    <SFContactStack.Screen 
      name="SFContactsList" 
      component={SFContactsScreen} 
      options={{ headerShown: false }} 
    />
    <SFContactStack.Screen 
      name="ContactDetailsScreen" 
      component={ContactDetailsScreen} 
    />
  </SFContactStack.Navigator>
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
            } else if (route.name === 'Lead') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'SFContacts') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Tasks') {
              iconName = focused ? 'list' : 'list-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Recents" component={Recents} />
        <Tab.Screen name="Phone" component={PhoneScreen} />
        <Tab.Screen name="Lead" component={LeadStackScreen} />
        <Tab.Screen name="SFContacts" component={SFContactStackScreen} />
        <Tab.Screen name="Tasks" component={TasksScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};


export default App;
