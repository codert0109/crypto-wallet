import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import {colors, fonts} from '../../styles';
import {PrimaryButton, SecondaryButton} from '../../components/Buttons';

//import actions
import {setMetadata} from '../../redux/actions/SetupActions';

//import images
const shapeImage = require('../../assets/images/icon.png');

const Setup = ({navigation, setMetadata}) => {
  const [setupLoading, setSetupLoading] = useState(false);
  useEffect(() => {}, []);

  const onPressSetup = () => {
    setMetadata(
      () => setSetupLoading(true),
      () => {
        setSetupLoading(false);
        // navigation.replace('mainscreen');
      },
      e => {
        setSetupLoading(false);
        console.log(e);
      },
    );
  };

  return (
    <KeyboardAvoidingView>
      <SafeAreaView
        style={{
          backgroundColor: colors.grey24,
          width: '100%',
          height: '100%',
          flexDirection: 'row',
          // alignItems: 'center',
          paddingHorizontal: 24,
        }}>
        <View style={{width: '100%'}}>
          <View
            style={{
              width: '100%',
              height: '100%',
              padding: 24,
              alignItems: 'center',
              paddingTop: 150,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
              }}>
              <Image source={shapeImage} style={{width: 100, height: 100}} />
            </View>
            <View style={{marginTop: 40, width: '100%'}}>
              <Text
                style={{
                  textAlign: 'left',
                  ...fonts.para_regular,
                  color: 'white',
                }}>
                {'  '}We are going to write your following encrypted metadata to
                blockchain. To secure, you need some assets. If you don't have
                now, please deposit first.
              </Text>
            </View>
            <View style={{marginTop: 16, width: '100%'}}>
              <Text
                style={{
                  ...fonts.para_regular,
                  color: 'white',
                  textAlign: 'left',
                }}>
                • Hash Type {'\n'}• Eth Address {'\n'}• Public Key {'\n'}• IMEI{' '}
                {'\n'}• ICCID(Your phone number)
              </Text>
            </View>
            <View style={{marginTop: 24}}>
              <Text
                style={{
                  textAlign: 'center',
                  ...fonts.para_regular,
                  color: 'white',
                }}></Text>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 120,
                width: '100%',
              }}>
              <PrimaryButton
                onPress={onPressSetup}
                loading={setupLoading}
                text="Proceed"
              />
              <View style={{height: 15}}></View>
              <SecondaryButton
                onPress={() => {
                  navigation.replace('mainscreen');
                }}
                text="Skip"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
  setMetadata: (beforeWork, successCallback, failCallback) =>
    setMetadata(dispatch, beforeWork, successCallback, failCallback),
});
export default connect(mapStateToProps, mapDispatchToProps)(Setup);
