import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  View,
} from 'react-native';

import {colors, commonStyles} from '../styles';
import {PrimaryButton, SecondaryButton} from '../components/Buttons';

//import images

const SelectScreen = ({navigation}) => {

  return (
    <KeyboardAvoidingView>
      <SafeAreaView
        style={{
          backgroundColor: colors.grey24,
          width: '100%',
          height: '100%',
        }}>
        <View
          style={{
            top: '16%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
          }}>
          <Image source={require('../assets/images/through/image4.png')} />
        </View>
        <View
          style={{width: '80%', position: 'absolute', top: '60%', left: '10%'}}>
          <Image source={require('../assets/images/through/title4.png')} />
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'column-reverse',
            marginBottom: 60,
            marginHorizontal: 24,
          }}>
          <View>
            <SecondaryButton
              onPress={() => {
                navigation.navigate('importwallet');
              }}
              text="Import Using Seed Phrase"
            />
            <View style={{height: 15}}></View>
            <PrimaryButton
              onPress={() => {
                navigation.navigate('createwallet');
              }}
              text="Create a New Wallet"
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SelectScreen;
