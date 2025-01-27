import { AppState } from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
import SignInScreen from './src/SignInScreen';
import { AuthContext } from './src/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = createStackNavigator();
const AuthStackScreen = ({ onSignIn }) => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="SignIn">
      {(props) => <SignInScreen {...props} onSignIn={onSignIn} />}
    </AuthStack.Screen>
  </AuthStack.Navigator>
);

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

// Main Tab Navigator Component
const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Lead" // Add this line
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
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // State to manage authentication

    const navigationRef = useRef(null);

    const onSignIn = useCallback(() => {
        setIsAuthenticated(true);
    }, []);
    
  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
        setUserToken(token);
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    } catch (e) {
      console.error('Error checking token:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
    
    // Add event listener for app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkToken();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);


  if (isLoading) {
    return null; // Or a loading screen component
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={TabNavigator} />
         ) : (
           <Stack.Screen 
            name="Auth" 
            // component={AuthStackScreen}
            >
              {(props) => <AuthStackScreen {...props} onSignIn={onSignIn} />}
            </Stack.Screen>
         )}
        
      </Stack.Navigator>
    </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App;