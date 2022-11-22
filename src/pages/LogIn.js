import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import {colors, fonts} from '../styles';
import FloatLabelInput from '../components/FloatLabelInput';
import {PrimaryButton} from '../components/Buttons';
import ToggleSwitch from 'toggle-switch-react-native';
import FontAwesome, {SolidIcons, RegularIcons} from 'react-native-fontawesome';
import {checkAuthentication, saveRememberOption} from '../utils/auth';

//import actions
import {loadAccountsDataFromStorage} from '../redux/actions/AccountsActions';
import {loadNetworksDataFromStorage} from '../redux/actions/NetworkActions';
import {loadTokensDataFromStorage} from '../redux/actions/TokensActions';
import {loadSettingsDataFromStorage} from '../redux/actions/SettingsAction';

//import images
const shapeImage = require('../assets/images/icon.png');
// import AsyncStorage from '@react-native-async-storage/async-storage';

const LogIn = ({
  navigation,
  loadAccountsDataFromStorage,
  loadNetworksDataFromStorage,
  loadTokensDataFromStorage,
  loadSettingsDataFromStorage,
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {}, []);

  const onPressLogIn = () => {
    setIsLoading(true);
    checkAuthentication(
      password,
      () => {
        saveRememberOption(
          rememberMe ? 'true' : 'false',
          () => {
            setIsLoading(false);
            loadAccountsDataFromStorage();
            loadNetworksDataFromStorage();
            loadTokensDataFromStorage();
            loadSettingsDataFromStorage();
            navigation.replace('mainscreen');
          },
          () => {
            setIsLoading(false);
            console.log('Something went wrong in login save rememberme');
          },
        );
      },
      () => {
        setIsLoading(false);
        setError('Password is wrong.');
      },
      () => {
        setIsLoading(false);
        console.log('Something went wrong in login');
      },
    );
  };

  useEffect(() => {
    // setTimeout(() => {
    //   navigation.replace('through');
    // }, 3000);
    return () => {};
  });

  return (
    <KeyboardAvoidingView>
      <SafeAreaView
        style={{
          backgroundColor: colors.grey24,
          width: '100%',
          height: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
        <View style={{width: '100%'}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: '100%',
            }}>
            <Image source={shapeImage} style={{width: 100, height: 100}} />
          </View>
          <TouchableOpacity onPress={() => {}}>
            <View
              style={{
                marginTop: 24,
                paddingLeft: 7,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: loginType == 0 ? 'white' : colors.grey12,
                  ...fonts.para_semibold,
                }}>
                Using Password{'   '}
              </Text>
              <FontAwesome
                style={{fontSize: 16, color: colors.grey12}}
                icon={SolidIcons.chevronRight}
              />
            </View>
          </TouchableOpacity>
          <View style={{marginTop: 24, width: '100%'}}>
            <FloatLabelInput
              label={'Password'}
              isPassword
              value={password}
              onChangeText={value => {
                setError('');
                setPassword(value);
              }}
              autoFocus
              style={error ? {borderColor: colors.red5} : {}}
            />
            {error.length > 0 && (
              <Text
                style={{
                  paddingLeft: 16,
                  ...fonts.caption_small12_16_regular,
                  color: colors.red5,
                }}>
                {error}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => {}}>
            <View
              style={{
                marginTop: 24,
                // width: '100%',
                paddingLeft: 7,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={{color: colors.grey12, ...fonts.para_semibold}}>
                Using Touch ID{'   '}
              </Text>
              <FontAwesome
                style={{fontSize: 16, color: colors.grey12}}
                icon={SolidIcons.chevronRight}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <View
              style={{
                marginTop: 24,
                // width: '100%',
                paddingLeft: 7,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={{color: colors.grey12, ...fonts.para_semibold}}>
                Using PIN{'   '}
              </Text>
              <FontAwesome
                style={{fontSize: 16, color: colors.grey12}}
                icon={SolidIcons.chevronRight}
              />
            </View>
          </TouchableOpacity>
          <View
            style={{
              marginTop: 24,
              width: '100%',
            }}>
            <ToggleSwitch
              isOn={rememberMe}
              onColor={colors.green5}
              offColor={colors.grey23}
              size="large"
              onToggle={isOn => setRememberMe(isOn)}
              animationSpeed={100}
              thumbOnStyle={{borderRadius: 6}}
              thumbOffStyle={{borderRadius: 6}}
              trackOnStyle={{borderRadius: 8, width: 68, height: 32}}
              trackOffStyle={{borderRadius: 8, width: 68, height: 32}}
              label={'Remember Me'}
              labelStyle={{color: colors.grey12, ...fonts.para_semibold}}
            />
          </View>
          <View style={{marginTop: 60}}>
            <PrimaryButton
              loading={isLoading}
              text={'Log In'}
              onPress={onPressLogIn}
              enableFlag={password.length > 0}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
  loadAccountsDataFromStorage: () => loadAccountsDataFromStorage(dispatch),
  loadNetworksDataFromStorage: () => loadNetworksDataFromStorage(dispatch),
  loadTokensDataFromStorage: () => loadTokensDataFromStorage(dispatch),
  loadSettingsDataFromStorage: () => loadSettingsDataFromStorage(dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
