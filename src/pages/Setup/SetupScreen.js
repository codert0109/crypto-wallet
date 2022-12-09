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
  Dimensions,
} from 'react-native';
import * as Progress from 'react-native-progress';

import {colors, fonts} from '../../styles';
import {PrimaryButton, SecondaryButton} from '../../components/Buttons';

//import actions
import {setMetadata} from '../../redux/actions/SetupActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {getCurrentPublicKeyFromStorage} from '../../utils/account';
import {
  getMetadataFromChain,
  verifyMasterAddressFromChain,
} from '../../utils/metadata';

//import images
const shapeImage = require('../../assets/images/icon.png');

const width = Dimensions.get('screen').width;
const stageTexts = [
  'Writing to blockchain...',
  'Calling api with pkce_challenge...',
  'Calling api with pkce_verifier...',
];

const Setup = ({navigation, setMetadata}) => {
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    getMetadata = async () => {
      const metadataBytesFromContract = await getMetadataFromChain();
      // const isMaster = await verifyMasterAddressFromChain();
      // console.log('asdfa', isMaster)
      if (metadataBytesFromContract && metadataBytesFromContract[0]) {
        setIsSaved(true);
        const isMaster = await verifyMasterAddressFromChain();
        if (!isMaster) {
          Alert.alert(
            '',
            'Your data is already set in chain. To change your data, you need to set the master address first.',
            [
              {
                text: 'Check Now',
                onPress: () => {
                  navigation.navigate('masterscreen');
                },
                style: 'cancel',
              },
            ],
            // {
            //   cancelable: true,
            //   onDismiss: () => {
            //     // Alert.alert(
            //     //   "This alert was dismissed by tapping outside of the alert dialog."
            //     // ),
            //   },
            // },
          );
        }
      }
    };
    getMetadata();
  }, []);

  const onPressSetup = () => {
    setError(null);
    if (isSaved && false) {
      setStage(1);
    } else {
      setStage(0);
    }
    setMetadata(
      () => setSetupLoading(true),
      () => {
        setSetupLoading(false);
        Toast.show({
          type: 'success',
          position: 'bottom',
          bottomOffset: 120,
          text1: 'Success',
        });
        navigation.replace('mainscreen');
      },
      e => {
        setSetupLoading(false);
        if (e == null) {
          setError('Please check your balance or network status!');
        } else {
          setError(e);
        }
      },
      n => setStage(n),
      isSaved,
    );
  };

  console.log(stage == 0 ? 0 : ((stage * 1.0) / stageTexts.length).toFixed(1));

  return (
    <KeyboardAvoidingView>
      <SafeAreaView
        style={{
          backgroundColor: colors.grey24,
          width: '100%',
          height: '100%',
          flexDirection: 'row',
          paddingHorizontal: 24,
        }}>
        <ScrollView>
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
                  {'  '}We are going to write your following encrypted metadata
                  to blockchain. To secure, you need some assets. If you don't
                  have now, please deposit first.
                </Text>
              </View>
              <View style={{marginTop: 16, width: '100%'}}>
                <Text
                  style={{
                    ...fonts.para_regular,
                    color: 'white',
                    textAlign: 'left',
                  }}>
                  • Hash Type {'\n'}• Eth Address {'\n'}• Public Key {'\n'}•
                  IMEI {'\n'}• ICCID(Your phone number)
                </Text>
              </View>
              <View style={{marginTop: 16, width: '100%'}}>
                <Text
                  style={{
                    paddingLeft: 16,
                    ...fonts.caption_small12_16_regular,
                    color: colors.red5,
                  }}>
                  {error}
                </Text>
              </View>
              {(setupLoading || error) && (
                <View style={{marginTop: 16, width: '100%'}}>
                  <Progress.Bar
                    progress={
                      stage == 0
                        ? 0
                        : ((stage * 1.0) / stageTexts.length).toFixed(1)
                    }
                    width={width - 96}
                    borderRadius={3}
                    height={15}
                    color={'rgba(30, 144, 252, 1)'}
                  />
                  <Text
                    style={{
                      ...fonts.para_regular,
                      fontSize: 12,
                      color: colors.green7,
                    }}>
                    {stageTexts[stage]}
                  </Text>
                </View>
              )}
              <View
                style={{
                  marginTop: 32,
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
                  enableFlag={!setupLoading}
                  text="Skip"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
  setMetadata: (
    beforeWork,
    successCallback,
    failCallback,
    progressCallback,
    isSaved,
  ) =>
    setMetadata(
      dispatch,
      beforeWork,
      successCallback,
      failCallback,
      progressCallback,
      isSaved,
    ),
});
export default connect(mapStateToProps, mapDispatchToProps)(Setup);
