import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {KeyboardAvoidingView, SafeAreaView, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome, {SolidIcons} from 'react-native-fontawesome';
import {colors, fonts} from '../../styles';
import ToggleSwitch from 'toggle-switch-react-native';
import {SvgXml} from 'react-native-svg';
import {PrimaryButton, SecondaryButton} from '../../components/Buttons';
import FloatLabelInput from '../../components/FloatLabelInput';

// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

// Import the ethers library
import {ethers, utils} from 'ethers';

const qrScanSvgXml = `<svg
width="24"
height="24"
viewBox="0 0 24 24"
fill="none"
xmlns="http://www.w3.org/2000/svg">
<path
  d="M21 8V5C21 3.895 20.105 3 19 3H16"
  stroke="${colors.green5}"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
/>
<path
  d="M8 3H5C3.895 3 3 3.895 3 5V8"
  stroke="${colors.green5}"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
/>
<path
  d="M3 16V19C3 20.105 3.895 21 5 21H8"
  stroke="${colors.green5}"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
/>
<path
  d="M16 21H19C20.105 21 21 20.105 21 19V16"
  stroke="${colors.green5}"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
/>
<path
  d="M3 12H21"
  stroke="${colors.green5}"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
/>
</svg>`;

import {passwordStrength} from 'check-password-strength';

import Constants from '../../constants';
import {createWallet} from '../../redux/actions/WalletActions';
const passwordStrengthCheckOption = Constants.passwordStrengthCheckOption;
const passwordLevelColor = Constants.passwordLevelColor;

const ImportWalletScreen = ({navigation, createWallet}) => {
  useEffect(() => {});
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [signInWithFaceId, setSignInWithFaceId] = useState(true);
  const [canPass, setCanPass] = useState(false);
  const [passwordStrengthLabel, setPasswordStrengthLabel] =
    useState('No Password');
  const [createPasswordModalVisible, setCreatePasswordModalVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const checkCanPass = data => {
    if (!data.seedPhrase) {
      setCanPass(false);
      return;
    }
    if (!utils.isValidMnemonic(data.seedPhrase)) {
      setCanPass(false);
      return;
    }
    setCanPass(true);
  };

  const onImportWallet = () => {
    createWallet(
      {
        mnemonic: seedPhrase,
      },
      () => {
        setLoading(true);
      },
      () => {
        console.log('success on press import');
        setLoading(false);
        setCreatePasswordModalVisible(false);
        navigation.replace('mainscreen');
      },
      () => {
        console.log('fail on press import');
        setLoading(false);
        setCreatePasswordModalVisible(false);
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
          paddingTop: 40,
        }}>
        <View style={{paddingHorizontal: 24, marginTop: 40}}>
          {/* <Modal
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
                  enableFlag={!loading}
                  onPress={() => {
                    setCreatePasswordModalVisible(false);
                  }}
                  text={'No, try again.'}
                />
                <SecondaryButton
                  onPress={() => {
                    onImportWallet();
                  }}
                  style={{width: 200}}
                  text="Yes, I am sure."
                  loading={loading}
                />
              </View>
            </View>
          </Modal> */}
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginBottom: 24,
              alignItems: 'center',
            }}>
            <View style={{width: '75%'}}>
              <FloatLabelInput
                label={'Seed Phrase'}
                value={seedPhrase}
                onChangeText={value => {
                  setSeedPhrase(value);
                  checkCanPass({password, passwordConfirm, seedPhrase: value});
                }}
                inputStyles={{
                  color: 'white',
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  color: 'white',
                  lineHeight: 24,
                  height: 100,
                  letterSpacing: 0,
                  fontWeight: 'bold',
                }}
                multiline
              />
              {seedPhrase.length > 0 && (
                <Text
                  style={{
                    paddingLeft: 16,
                    ...fonts.caption_small12_16_regular,
                    color: utils.isValidMnemonic(seedPhrase)
                      ? colors.green5
                      : colors.grey12,
                  }}>
                  {utils.isValidMnemonic(seedPhrase)
                    ? 'Valid Seed Phrase '
                    : 'Seed Phrase must be valid. '}
                  {utils.isValidMnemonic(seedPhrase) && (
                    <FontAwesome
                      style={{
                        fontSize: 12,
                        color: colors.green5,
                      }}
                      icon={SolidIcons.check}
                    />
                  )}
                </Text>
              )}
            </View>
            <View
              style={{
                width: '25%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <SvgXml xml={qrScanSvgXml} />
            </View>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'column-reverse',
            marginBottom: 60,
            marginHorizontal: 24,
          }}>
          <SecondaryButton
            enableFlag={canPass}
            onPress={() => {
              onImportWallet();
            }}
            text="Import"
            loading={loading}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
  createWallet: (data, beforeWork, successCallback, failCallback) =>
    createWallet(dispatch, data, beforeWork, successCallback, failCallback),
});

export default connect(mapStateToProps, mapDispatchToProps)(ImportWalletScreen);
