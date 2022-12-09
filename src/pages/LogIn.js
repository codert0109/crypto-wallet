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

import {colors, fonts} from '../styles';
import FloatLabelInput from '../components/FloatLabelInput';
import {PrimaryButton} from '../components/Buttons';
import FingerPrintScreen from '../components/fingerprint/Application.container';
import ToggleSwitch from 'toggle-switch-react-native';
import FontAwesome, {SolidIcons, RegularIcons} from 'react-native-fontawesome';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import PINCode, {
  hasUserSetPinCode,
  resetPinCodeInternalStates,
  deleteUserPinCode,
} from '@haskkor/react-native-pincode';
import {
  checkAuthentication,
  checkAuthenticationByPinCode,
  saveRememberOption,
  getLoginType,
} from '../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

//import actions
import {loadAccountsDataFromStorage} from '../redux/actions/AccountsActions';
import {loadNetworksDataFromStorage} from '../redux/actions/NetworkActions';
import {loadTokensDataFromStorage} from '../redux/actions/TokensActions';
import {loadSettingsDataFromStorage} from '../redux/actions/SettingsAction';

import {getCurrentPublicKeyFromStorage} from '../utils/account';
import {getMetadataFromChain} from '../utils/metadata';
import constants from '../constants';

//import images
const shapeImage = require('../assets/images/icon.png');
const util = require('ethereumjs-util');

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
  const [isFingerPrintAvailable, setIsFingerPrintAvailable] = useState(true);
  const [isFingerPrintUsed, setIsFingerPrintUsed] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    detectFingerprintAvailable();
    getLoginTypeFromStorate();
  }, []);

  getLoginTypeFromStorate = async () => {
    const _isFingerPrintUsed = await getLoginType();
    setIsFingerPrintUsed(_isFingerPrintUsed);
  };

  detectFingerprintAvailable = () => {
    FingerprintScanner.isSensorAvailable().catch(error => {
      setIsFingerPrintAvailable(false);
    });
  };

  const successLogin = () => {
    saveRememberOption(
      rememberMe ? 'true' : 'false',
      () => {
        setIsLoading(false);
        AsyncStorage.getItem('accounts_info')
          .then(res => {
            if (res) {
              loadAccountsDataFromStorage();
              loadNetworksDataFromStorage();
              loadTokensDataFromStorage();
              loadSettingsDataFromStorage();
              navigation.replace('mainscreen');
              // const accounts_info = JSON.parse(res);
              // const {accounts, currentAccountIndex} = accounts_info;
              // const currentAccountPublicKey = util.privateToPublic(
              //   Buffer.from(accounts[currentAccountIndex].privateKey, 'hex'),
              // );
              // const currentAccountPublicKeyEncoded = btoa(
              //   JSON.stringify(currentAccountPublicKey),
              // );
              // AsyncStorage.getItem('metadata').then(async e => {
              //   if (e) {
              //     metadata = JSON.parse(e);
              //     console.log({metadata});
              //     if (metadata[0] == undefined) {
              //       return navigation.replace('setupscreen');
              //     }
              //     const currentMetadataIndex = metadata.findIndex(
              //       r => r.public_key == currentAccountPublicKeyEncoded,
              //     );
              //     if (currentMetadataIndex >= 0) {
              //       const _metadata = metadata[currentMetadataIndex];
              //       if (_metadata.isSaved) {
              //         navigation.replace('mainscreen');
              //       } else {
              //         navigation.replace('setupscreen');
              //       }
              //     } else {
              //       navigation.replace('mainscreen');
              //       // console.log('1')
              //       // const {status, metadata} = await getMetadataFromChain();
              //       // if (status) {
              //       //   if (status == constants.metadata.SAME) {
              //       //     let newData = [
              //       //       {
              //       //         metadata,
              //       //         hash: null,
              //       //         isSaved: false,
              //       //       },
              //       //     ];
              //       //     const isSuccess = await AsyncStorage.setItem(
              //       //       'metadata',
              //       //       JSON.stringify(newData),
              //       //     );
              //       //     if (isSuccess) {
              //       //       navigation.replace('mainscreen');
              //       //     } else {
              //       //       navigation.replace('setupscreen');
              //       //     }
              //       //   } else if (status == constants.metadata.DIFFERENT) {
              //       //     Alert.alert(
              //       //       'Your metadata is set already but different from current data in localStorage. You need to sync this data first. Before doing that, you need to set the master address first so that can change metadata.',
              //       //     );
              //       //     navigation.replace('masterscreen');
              //       //   } else {
              //       //     navigation.replace('setupscreen');
              //       //   }
              //       // } else {
              //       //   navigation.replace('setupscreen');
              //       // }
              //       // console.log('2');
              //     }
              //   } else {
              //     const {status, metadata} = await getMetadataFromChain();
              //     if (status) {
              //       if (status == constants.metadata.SAME) {
              //         let newData = [
              //           {
              //             metadata,
              //             hash: null,
              //             isSaved: false,
              //           },
              //         ];
              //         const isSuccess = await AsyncStorage.setItem(
              //           'metadata',
              //           JSON.stringify(newData),
              //         );
              //         if (isSuccess) {
              //           navigation.replace('mainscreen');
              //         } else {
              //           navigation.replace('setupscreen');
              //         }
              //       } else if (status == constants.metadata.DIFFERENT) {
              //         Alert.alert(
              //           'Your metadata is set already but different from current data in localStorage. You need to sync this data first. Before doing that, you need to set the master address first so that can change metadata.',
              //         );
              //         navigation.replace('masterscreen');
              //       } else {
              //         navigation.replace('setupscreen');
              //       }
              //     } else {
              //       navigation.replace('setupscreen');
              //     }
              //   }
              // });
            } else {
              navigation.replace('selectscreen');
            }
          })
          .catch(e => Alert.alert(e));
      },
      () => {
        setIsLoading(false);
        console.log('Something went wrong in login');
      },
    );
  };

  const onPressLogIn = () => {
    setIsLoading(true);
    checkAuthentication(
      password,
      () => {
        successLogin();
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

  const onLoginByFingerPrint = () => {
    if (isFingerPrintAvailable == false) {
      return;
    }
    if (loginType != 1) {
      return;
    }
    successLogin();
  };

  const checkPinCode = pinCode => {
    setIsLoading(true);
    checkAuthenticationByPinCode(
      pinCode,
      () => {
        successLogin();
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

  return (
    <KeyboardAvoidingView>
      <SafeAreaView
        style={{
          backgroundColor: colors.grey24,
          width: '100%',
          height: '100%',
          flexDirection: 'row',
          // alignItems: 'center',
          paddingTop: 100,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
        <View style={{width: '100%'}}>
          <ScrollView>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
              }}>
              <Image source={shapeImage} style={{width: 100, height: 100}} />
            </View>
            <TouchableOpacity
              onPress={() => {
                setLoginType(0);
              }}>
              <View
                style={{
                  marginTop: 40,
                  paddingLeft: 8,
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
            {loginType == 0 && (
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
            )}
            {isFingerPrintAvailable && isFingerPrintUsed && (
              <TouchableOpacity
                onPress={() => {
                  setLoginType(1);
                }}>
                <View
                  style={{
                    marginTop: 24,
                    width: '100%',
                    paddingLeft: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: loginType == 1 ? 'white' : colors.grey12,
                      ...fonts.para_semibold,
                    }}>
                    Using Touch ID{'   '}
                  </Text>
                  <FontAwesome
                    style={{fontSize: 16, color: colors.grey12}}
                    icon={SolidIcons.chevronRight}
                  />
                </View>
              </TouchableOpacity>
            )}
            {loginType == 1 && isFingerPrintUsed && isFingerPrintAvailable && (
              <View style={{width: '100%', height: 200}}>
                <FingerPrintScreen
                  success={is_success => {
                    if (is_success) {
                      onLoginByFingerPrint();
                    } else {
                      setLoginType(0);
                    }
                  }}
                />
              </View>
            )}
            <TouchableOpacity
              onPress={() => {
                setLoginType(2);
              }}>
              <View
                style={{
                  marginTop: 24,
                  width: '100%',
                  paddingLeft: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: loginType == 2 ? 'white' : colors.grey12,
                    ...fonts.para_semibold,
                  }}>
                  Using PIN{'   '}
                </Text>
                <FontAwesome
                  style={{fontSize: 16, color: colors.grey12}}
                  icon={SolidIcons.chevronRight}
                />
              </View>
            </TouchableOpacity>
            {loginType == 2 && (
              <View style={{width: '100%', height: 'auto', marginTop: 40}}>
                <PINCode
                  status={'enter'}
                  touchIDDisabled={true}
                  endProcessFunction={e => {
                    checkPinCode(e);
                  }}
                  maxAttempts={5}
                  onClickButtonLockedPage={() => setLoginType(0)}
                  textTitleLockedPage={'   '}
                  textButtonLockedPage={'Using Password'}
                  buttonDeleteText={'Del'}
                  textDescriptionLockedPage={'   '}
                  textSubDescriptionLockedPage={'   '}
                  styleLockScreenMainContainer={{
                    backgroundColor: colors.grey24,
                  }}
                  styleLockScreenButton={{color: 'white'}}
                />
              </View>
            )}
            {true && (
              <>
                <View
                  style={{
                    marginTop: 48,
                    marginBottom: 30,
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
                <View style={{marginTop: 30, marginBottom: 60, width: '100%'}}>
                  <PrimaryButton
                    loading={isLoading}
                    text={'Log In'}
                    onPress={onPressLogIn}
                    enableFlag={password.length > 0}
                  />
                </View>
              </>
            )}
          </ScrollView>
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
