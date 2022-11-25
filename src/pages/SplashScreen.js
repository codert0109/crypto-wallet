import React, {useEffect} from 'react';
import {Image, KeyboardAvoidingView, SafeAreaView, Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {colors} from '../styles';

//import images
const logoImage = require('../assets/images/splash/shape.png');
const shapeImage = require('../assets/images/logo.png');

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    setTimeout(() => {
      nextSplash();
    }, 2000);
    return () => {};
  });

  const nextSplash = async () => {
    const savedPassword = await AsyncStorage.getItem('password');
    const rememberMe = await AsyncStorage.getItem('remember_me');
    // navigation.replace('importwallet');
    // return;
    if (rememberMe === 'true') {
      navigation.replace('mainscreen');
      return;
    }
    if (savedPassword) {
      navigation.replace('login');
      return;
    } else {
      navigation.replace('through');
    }
  };

  return (
    <KeyboardAvoidingView>
      <SafeAreaView
        // onTouchEnd={nextSplash}
        style={{
          backgroundColor: colors.grey24,
          width: '100%',
          height: '100%',
        }}>
        <Image
          source={logoImage}
          style={{
            left: '70%',
            top: '-10%',
            width: '30%',
            // height: '10%',
            resizeMode: 'contain',
          }}
        />
        <Image
          source={shapeImage}
          style={{
            // left: '40%',
            top: '-20%',
            width: '100%',
            // height: '100%',
            resizeMode: 'contain',
          }}
        />
        <Text
          style={{
            fontFamily: 'Poppins',
            fontSize: 42,
            color: 'white',
            width: '50%',
            left: '10%',
            top: '-10%',
          }}>
          Millions of people participate
        </Text>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SplashScreen;
