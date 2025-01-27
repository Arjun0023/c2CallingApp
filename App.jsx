import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import your components
import Recents from './src/Recents';
import LeadScreen from './src/LeadScreen';
import LeadDetailsScreen from './src/LeadDetailsScreen';
import SFContactsScreen from './src/SFContactsScreen';
import ContactDetailsScreen from './src/ContactDetailsScreen';
import TasksScreen from './src/TasksScreen';
import Meetings from './src/Meetings';
import RecordMeeting from './src/RecordMeeting';
import ComingSoon from './src/ComingSoon';

// Lead Stack
const LeadStack = createStackNavigator();
const LeadStackScreen = () => (
  <LeadStack.Navigator screenOptions={{ headerShown: false }}>
    <LeadStack.Screen 
      name="Leads" 
      component={LeadScreen}
      options={{ title: 'Leads' }}
    />
    <LeadStack.Screen 
      name="LeadDetailsScreen" 
      component={LeadDetailsScreen}
      options={{ title: 'Lead Details' }}
    />
  </LeadStack.Navigator>
);

// SFContacts Stack
const SFContactStack = createStackNavigator();
const SFContactStackScreen = () => (
  <SFContactStack.Navigator screenOptions={{ headerShown: false }}>
    <SFContactStack.Screen 
      name="Contacts" 
      component={SFContactsScreen}
      options={{ title: 'Contacts' }}
    />
    <SFContactStack.Screen 
      name="ContactDetailsScreen" 
      component={ContactDetailsScreen}
      options={{ title: 'Contact Details' }}
    />
  </SFContactStack.Navigator>
);

// Meetings Stack
const MeetingsStack = createStackNavigator();
const MeetingsStackScreen = () => (
  <MeetingsStack.Navigator screenOptions={{ headerShown: false }}>
    <MeetingsStack.Screen 
      name="MeetingsList" 
      component={Meetings}
      options={{ title: 'Meetings' }}
    />
    <MeetingsStack.Screen 
      name="RecordMeeting" 
      component={RecordMeeting}
      options={{ title: 'Record Meeting' }}
    />
  </MeetingsStack.Navigator>
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
            } else if (route.name === 'Lead') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'SFContacts') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Tasks') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Meetings') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Recents" component={Recents} />
        <Tab.Screen name="Meetings" component={MeetingsStackScreen} />
        <Tab.Screen name="Lead" component={LeadStackScreen} />
        <Tab.Screen name="SFContacts" component={SFContactStackScreen} />
        <Tab.Screen name="Tasks" component={TasksScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;