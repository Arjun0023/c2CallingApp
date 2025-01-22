import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Linking, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const DialerButton = ({ mainText, subText, onPress, isZero }) => (
  <TouchableOpacity 
    style={styles.dialerButton} 
    onPress={onPress}
    activeOpacity={0.6}
  >
    <Text style={[
      styles.dialerButtonText, 
      isZero && styles.zeroText
    ]}>
      {mainText}
    </Text>
    {subText && <Text style={styles.subText}>{subText}</Text>}
  </TouchableOpacity>
);

const PhoneScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleNumberPress = (num) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    const phoneUrl = `tel:${phoneNumber}`;

    try {
      if (Platform.OS === 'ios') {
        // Check if device can make phone calls (iOS)
        const canOpen = await Linking.canOpenURL(phoneUrl);
        if (!canOpen) {
          Alert.alert('Error', 'Device cannot make phone calls');
          return;
        }
      }

      await Linking.openURL(phoneUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to make phone call');
    }
  };

  const formatPhoneNumber = (number) => {
    if (!number) return '';
    return number;
  };

  const dialerButtons = [
    { main: '1', sub: '' },
    { main: '2', sub: 'ABC' },
    { main: '3', sub: 'DEF' },
    { main: '4', sub: 'GHI' },
    { main: '5', sub: 'JKL' },
    { main: '6', sub: 'MNO' },
    { main: '7', sub: 'PQRS' },
    { main: '8', sub: 'TUV' },
    { main: '9', sub: 'WXYZ' },
    { main: '*', sub: '' },
    { main: '0', sub: '+' },
    { main: '#', sub: '' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.phoneNumberText}>
          {formatPhoneNumber(phoneNumber)}
        </Text>
      </View>

      <View style={styles.keypadContainer}>
        <View style={styles.keypad}>
          {dialerButtons.map((button, index) => (
            <DialerButton
              key={index}
              mainText={button.main}
              subText={button.sub}
              onPress={() => handleNumberPress(button.main)}
              isZero={button.main === '0'}
            />
          ))}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.emptySpace} />
          <TouchableOpacity 
            style={[
              styles.callButton,
              !phoneNumber && styles.callButtonDisabled
            ]}
            onPress={handleCall}
            activeOpacity={0.8}
            disabled={!phoneNumber}
          >
            <Icon name="call" size={30} color="#fff" />
          </TouchableOpacity>
          {phoneNumber.length > 0 && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.6}
            >
              <View style={styles.deleteIconCircle}>
                <Icon name="backspace" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          )}
          {phoneNumber.length === 0 && <View style={styles.emptySpace} />}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 120,
  },
  phoneNumberText: {
    fontSize: 34,
    color: '#000',
    letterSpacing: 1,
    textAlign: 'center',
  },
  keypadContainer: {
    paddingBottom: 40,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dialerButton: {
    width: '33.33%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialerButtonText: {
    fontSize: 36,
    color: '#000',
    includeFontPadding: false,
    lineHeight: 42,
  },
  zeroText: {
    fontSize: 36,
  },
  subText: {
    fontSize: 11,
    color: '#000',
    marginTop: -2,
    letterSpacing: 1.5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  callButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#30D158',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonDisabled: {
    opacity: 0.6,
  },
  deleteButton: {
    width: '33.33%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySpace: {
    width: '33.33%',
    aspectRatio: 1.5,
  },
});

export default PhoneScreen;