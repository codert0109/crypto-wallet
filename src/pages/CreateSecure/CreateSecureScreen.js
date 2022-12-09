import React, {useState, useEffect, createRef, useRef} from 'react';

import {connect} from 'react-redux';
import {
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  View,
  Linking,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  PrimaryButton,
  TextButton,
  SecondaryButton,
} from '../../components/Buttons';
import Modal from 'react-native-modal';
import FontAwesome, {SolidIcons, RegularIcons} from 'react-native-fontawesome';
import {colors, fonts} from '../../styles';
import ToggleSwitch from 'toggle-switch-react-native';
import CheckBox from 'react-native-check-box';
import PINCode from '@haskkor/react-native-pincode';
import FingerPrintScreen from '../../components/fingerprint/Application.container';
import {SvgXml} from 'react-native-svg';
import createPasswordTitleSvgXml from './createPasswordTitleSVG';
import successTitleSvgXml from './successTitleSVG';
import FloatLabelInput from '../../components/FloatLabelInput';

import Constants from '../../constants';
//import actions
import {createSecure} from '../../redux/actions/SecureActions';

//import utils
import {passwordStrength} from 'check-password-strength';
import {createMnemonic} from '../../utils/mnemonic';

const passwordStrengthCheckOption = Constants.passwordStrengthCheckOption;
const passwordLevelColor = Constants.passwordLevelColor;

const count_stages = 4;

// stage 1 -> password
// stage 2 -> fingerprint
// stage 3 -> pin
// stage 4 -> success

const CreateSecureScreen = ({navigation}) => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordStrengthLabel, setPasswordStrengthLabel] =
    useState('No Password');
  const [createPasswordModalVisible, setCreatePasswordModalVisible] =
    useState(false);
  const [isFingerPrintUsed, setIsFingerPrintUsed] = useState(false);
  const [signInWithFaceId, setSignInWithFaceId] = useState(true);
  const [isAgreeChecked, setIsAgreeChecked] = useState(true);
  const [canPass, setCanPass] = useState(false);
  const [pinCode, setPinCode] = useState(null);
  const [successLoading, setSuccessLoading] = useState(false);

  const [status, setStatus] = useState(0);
  const [mnemonic, setMnemonic] = useState([]);

  useEffect(() => {
    let phrase = createMnemonic();
    phrase = phrase.split(' ');
    setMnemonic(phrase);
    return () => {};
  }, []);

  const onPressCreatePassword = async () => {
    setStatus(1);
  };

  const setPin = async e => {
    setPinCode(e);
    setStatus(3);
  };

  const onPressSuccess = () => {
    createSecure(
      {
        password,
        isFingerPrintUsed: isFingerPrintUsed,
        pinCode: pinCode,
      },
      () => {
        setSuccessLoading(true);
      },
      () => {
        console.log('success on press success');
        setSuccessLoading(false);
        navigation.replace('selectscreen');
      },
      () => {
        console.log('fail on press success');
        Alert.alert('Failed to create secure', 'Please try again later!');
        setSuccessLoading(false);
      },
    );
  };

  const checkCanPass = data => {
    if (!data.password) {
      setCanPass(false);
      return;
    }
    if (!data.passwordConfirm) {
      setCanPass(false);
      return;
    }
    if (!data.isAgreeChecked) {
      setCanPass(false);
      return;
    }
    if (data.password.length < 8) {
      setCanPass(false);
      return;
    }
    if (data.password !== data.passwordConfirm) {
      setCanPass(false);
      return;
    }
    setCanPass(true);
  };

  const createSecureHeaderRender = () => {
    return (
      <View
        style={{
          backgroundColor: colors.grey24,
          paddingTop: 44,
          paddingHorizontal: 16,
          paddingBottom: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View>
          <TouchableOpacity
            onPress={() => {
              if (status === 3) {
                // success
                setStatus(2);
              } else if (status === 2) {
                // pin
                setStatus(1);
              } else if (status === 1) {
                // fingerprint
                setStatus(0);
                setCreatePasswordModalVisible(false);
              } else if (status === 0) {
                // password
                navigation.goBack();
              }
            }}
            style={{width: 20}}>
            <FontAwesome
              style={{fontSize: 16, color: 'white'}}
              icon={SolidIcons.chevronLeft}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            justifyContent: 'space-around',
            flexDirection: 'row',
            flex: 1,
            height: 8,
          }}>
          <View
            style={{
              width: '20%',
              height: 8,
              backgroundColor: colors.green5,
              borderRadius: 2,
            }}></View>
          <View
            style={{
              width: '20%',
              height: 8,
              backgroundColor: status >= 1 ? colors.green5 : colors.grey23,
            }}></View>
          <View
            style={{
              width: '20%',
              height: 8,
              backgroundColor: status >= 2 ? colors.green5 : colors.grey23,
            }}></View>
          <View
            style={{
              width: '20%',
              height: 8,
              backgroundColor: status >= 3 ? colors.green5 : colors.grey23,
            }}></View>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text
            style={{color: colors.grey13, ...fonts.caption_small12_16_regular}}>
            {status + 1 + '/' + count_stages}
          </Text>
        </View>
      </View>
    );
  };

  const createPasswordRender = () => {
    return (
      <View style={{height: '100%'}}>
        <Modal
          isVisible={createPasswordModalVisible}
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              padding: 24,
              borderRadius: 12,
            }}>
            <Text style={{color: 'black', textAlign: 'center'}}>
              <Text style={{...fonts.title2}}>Password is not strong.</Text>
              {'\n'}Are you sure you want to use this passord?
            </Text>
            <View
              style={{
                marginTop: 24,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <PrimaryButton
                onPress={() => {
                  setCreatePasswordModalVisible(false);
                }}
                text={'No, try again.'}
              />
              <SecondaryButton
                onPress={() => {
                  onPressCreatePassword();
                }}
                style={{width: 200}}
                text="Yes, I am sure."
              />
            </View>
          </View>
        </Modal>
        <View style={{width: '100%', alignItems: 'center', paddingTop: 40}}>
          <View>
            <SvgXml xml={createPasswordTitleSvgXml} />
          </View>
          <View>
            <Text
              style={{
                color: colors.grey9,
                ...fonts.para_regular,
                textAlign: 'center',
                paddingHorizontal: 24,
                paddingTop: 16,
              }}>
              This password will unlock your Smart Contract Wallet only on this
              service.
            </Text>
          </View>
        </View>
        <View style={{width: '100%', paddingHorizontal: 24, marginTop: 40}}>
          <View style={{marginBottom: 24}}>
            <FloatLabelInput
              label={'New Password'}
              isPassword={true}
              value={password}
              onChangeText={value => {
                setPassword(value);
                checkCanPass({
                  password: value,
                  passwordConfirm,
                  isAgreeChecked,
                });
                setPasswordStrengthLabel(
                  passwordStrength(value, passwordStrengthCheckOption).value,
                );
              }}
            />
            {password.length > 0 && (
              <>
                <Text
                  style={{
                    paddingLeft: 16,
                    ...fonts.caption_small12_16_regular,
                    color: colors.grey12,
                  }}>
                  Password strength:{' '}
                  <Text
                    style={{color: passwordLevelColor[passwordStrengthLabel]}}>
                    {passwordStrengthLabel}
                  </Text>
                </Text>
                {password.length < 8 && (
                  <Text
                    style={{
                      paddingLeft: 16,
                      paddingTop: 4,
                      ...fonts.caption_small12_16_regular,
                      color: colors.grey12,
                    }}>
                    Must be at least 8 characters.
                  </Text>
                )}
              </>
            )}
          </View>
          <View>
            <FloatLabelInput
              label={'Confirm Password'}
              isPassword={true}
              value={passwordConfirm}
              onChangeText={value => {
                setPasswordConfirm(value);
                checkCanPass({
                  password,
                  passwordConfirm: value,
                  isAgreeChecked,
                });
              }}
            />
            {passwordConfirm.length > 0 && (
              <Text
                style={{
                  paddingLeft: 16,
                  ...fonts.caption_small12_16_regular,
                  color:
                    password === passwordConfirm
                      ? colors.green5
                      : colors.grey12,
                }}>
                {password === passwordConfirm
                  ? 'Password matched. '
                  : 'Password must match.'}
                {password === passwordConfirm && (
                  <FontAwesome
                    style={{
                      fontSize: 12,
                      color: colors.green5,
                      marginLeft: 12,
                    }}
                    icon={SolidIcons.check}
                  />
                )}
              </Text>
            )}
          </View>
        </View>
        {/* <View
          style={{
            marginTop: 40,
            flexDirection: 'row',
            paddingHorizontal: 32,
          }}>
          <View style={{width: '60%'}}>
            <Text style={{...fonts.title2, color: 'white'}}>
              Sign in with Face ID?
            </Text>
          </View>
          <View style={{width: '40%', alignItems: 'flex-end'}}>
            <ToggleSwitch
              isOn={signInWithFaceId}
              onColor={colors.green5}
              offColor={colors.grey23}
              size="large"
              onToggle={isOn => setSignInWithFaceId(isOn)}
              animationSpeed={100}
              thumbOnStyle={{borderRadius: 6}}
              thumbOffStyle={{borderRadius: 6}}
              trackOnStyle={{borderRadius: 8, width: 68, height: 32}}
              trackOffStyle={{borderRadius: 8, width: 68, height: 32}}
            />
          </View>
        </View> */}
        <View
          style={{
            marginTop: 24,
            flexDirection: 'row',
            paddingLeft: 24,
            paddingRight: 24,
            alignItems: 'center',
          }}>
          <CheckBox
            checkedCheckBoxColor={colors.green5}
            checkBoxColor={colors.grey13}
            isChecked={isAgreeChecked}
            onClick={() => {
              let value = !isAgreeChecked;
              setIsAgreeChecked(value);
              checkCanPass({
                password,
                passwordConfirm,
                isAgreeChecked: value,
              });
            }}
          />
          <View
            style={{
              marginLeft: 8,
              width: '80%',
            }}>
            <Text
              style={{
                color: 'white',
                ...fonts.para_regular,
              }}>
              I understand that this wallet cannot recover this password for me.{' '}
              <Text
                style={{color: colors.blue5}}
                onPress={() => Linking.openURL('http://google.com')}>
                Learn more
              </Text>
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'column-reverse',
            marginBottom: 120,
            marginHorizontal: 24,
          }}>
          <PrimaryButton
            enableFlag={canPass}
            onPress={() => {
              if (
                passwordStrength(password, passwordStrengthCheckOption).id < 2
              ) {
                setCreatePasswordModalVisible(true);
                return;
              }
              onPressCreatePassword();
            }}
            text="Create Password"
          />
        </View>
      </View>
    );
  };

  const fingerprintRender = () => {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color: '#ffffff',
            fontSize: 22,
            marginTop: 30,
            marginBottom: 5,
          }}>
          Please touch below
        </Text>
        <TouchableOpacity
          onPress={() => {
            setStatus(2);
          }}>
          <View
            style={{
              marginTop: 40,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: 'white',
                // ...fonts.para_semibold,
              }}>
              Skip{'  '}
            </Text>
            <FontAwesome
              style={{fontSize: 16, color: colors.grey12}}
              icon={SolidIcons.chevronRight}
            />
          </View>
        </TouchableOpacity>
        <FingerPrintScreen
          success={is_fingerprint_used => {
            setStatus(2);
            setIsFingerPrintUsed(is_fingerprint_used);
          }}
        />
      </View>
    );
  };

  const createPinRender = () => {
    return (
      <View style={{height: '100%'}}>
        <PINCode
          status={'choose'}
          touchIDDisabled={true}
          storePin={e => {
            setPin(e);
          }}
          buttonDeleteText={'Del'}
        />
      </View>
    );
  };

  const successRender = () => {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          padding: 24,
          alignItems: 'center',
          paddingTop: 150,
        }}>
        <View>
          <SvgXml xml={successTitleSvgXml} />
        </View>
        <View style={{marginTop: 40}}>
          <Text
            style={{
              textAlign: 'center',
              ...fonts.para_regular,
              color: 'white',
            }}>
            Congratulations
          </Text>
        </View>
        <View style={{marginTop: 24}}>
          <Text
            style={{
              textAlign: 'center',
              ...fonts.para_regular,
              color: 'white',
            }}>
            You have registered successfully.
          </Text>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 120,
            width: '100%',
          }}>
          <PrimaryButton
            onPress={onPressSuccess}
            loading={successLoading}
            text="Success"
          />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView>
      <SafeAreaView
        style={{
          backgroundColor: colors.grey24,
          width: '100%',
          height: '100%',
        }}>
        {createSecureHeaderRender()}
        {status === 0 && createPasswordRender()}
        {status === 1 && fingerprintRender()}
        {status === 2 && createPinRender()}
        {status === 3 && successRender()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CreateSecureScreen);
