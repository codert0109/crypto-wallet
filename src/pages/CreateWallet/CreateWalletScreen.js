import React, {useState, useEffect, createRef, useRef} from 'react';

import {connect} from 'react-redux';
import {
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  PrimaryButton,
  TextButton,
  SecondaryButton,
} from '../../components/Buttons';
import FontAwesome, {SolidIcons, RegularIcons} from 'react-native-fontawesome';
import {colors, fonts} from '../../styles';
import CheckBox from 'react-native-check-box';
import ConfirmSeedScreen from './ConfirmSeedScreen';
import {SvgXml} from 'react-native-svg';
import {BlurView} from '@react-native-community/blur';
import RBSheet from 'react-native-raw-bottom-sheet';
import secureWalletTitleSvgXml from './secureWalletTitleSVG';
import infoCircleIconSvgXml from './infoCircleIconSVG';
import writeSeedTitleSvgXml from './writeSeedTitleSVG';
import successTitleSvgXml from './successTitleSVG';

//import actions
import {createWallet} from '../../redux/actions/WalletActions';

//import utils
import {createMnemonic} from '../../utils/mnemonic';

const image = require('../../assets/images/createwallet2/image.png');

const count_stages = 5;

// stage 1 -> secure_wallet  status 0
// stage 2 -> secure_seed    1
// stage 3 -> write_seed      2
// stage 4 -> confirm_seed     3
// stage 5 -> success           4

const screenWidth = Dimensions.get('screen').width;

const CreateWalletScreen = ({navigation, createWallet}) => {
  const [showSeed, setShowSeed] = useState(false);
  const [viewRef, setViewRef] = useState(null);
  const [understandNotSecurity, setUnderstandNotSecurity] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);

  const backgroundImageRef = createRef();
  const refRBSkipSecuritySheet = useRef(null);
  const refRBSeedPhraseSheet = useRef(null);
  const refRBProtectWalletSheet = useRef(null);

  const [status, setStatus] = useState(0);
  const [mnemonic, setMnemonic] = useState([]);

  useEffect(() => {
    let phrase = createMnemonic();
    phrase = phrase.split(' ');
    setMnemonic(phrase);
    return () => {};
  }, []);

  const onPressSuccess = () => {
    setSuccessLoading(true);
    createWallet(
      {
        mnemonic: mnemonic.join(' '),
      },
      () => {
        setSuccessLoading(true);
      },
      () => {
        console.log('success on press success');
        setSuccessLoading(false);
        navigation.replace('mainscreen');
      },
      () => {
        console.log('fail on press success');
        Alert.alert('Failed to create secure', 'Please try again later!');
        setSuccessLoading(false);
      },
    );
  };

  const createWalletHeaderRender = () => {
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
              if (status > 0) {
                setStatus(status - 1);
              } else if (status === 0) {
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
              width: '16%',
              height: 8,
              backgroundColor: colors.green5,
              borderRadius: 2,
            }}></View>
          <View
            style={{
              width: '16%',
              height: 8,
              backgroundColor: status >= 1 ? colors.green5 : colors.grey23,
            }}></View>
          <View
            style={{
              width: '16%',
              height: 8,
              backgroundColor: status >= 2 ? colors.green5 : colors.grey23,
            }}></View>
          <View
            style={{
              width: '16%',
              height: 8,
              backgroundColor: status >= 3 ? colors.green5 : colors.grey23,
            }}></View>
          <View
            style={{
              width: '16%',
              height: 8,
              backgroundColor: status >= 4 ? colors.green5 : colors.grey23,
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

  const successRender = () => {
    console.log(successLoading);
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
            You've successfully protected your wallet. Remember to keep your
            seed phrase safe, it's your responsibility!
          </Text>
        </View>
        <View style={{marginTop: 24}}>
          <Text
            style={{
              textAlign: 'center',
              ...fonts.para_regular,
              color: 'white',
            }}>
            BlockAuthy cannot recover your wallet should you lose it. You can
            find your seedphrase in Setings &gt; Security &amp; Privacy
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

  const secureWalletRender = () => {
    return (
      <View style={{height: '100%'}}>
        <RBSheet
          height={280}
          ref={refRBSkipSecuritySheet}
          closeOnDragDown={true}
          closeOnPressBack={false}
          closeOnPressMask={false}
          customStyles={{
            wrapper: {
              backgroundColor: '#222531BB',
            },
            draggableIcon: {
              backgroundColor: colors.grey9,
            },
            container: {
              backgroundColor: colors.grey24,
            },
          }}>
          <View>
            <View style={{paddingTop: 16}}>
              <Text
                style={{...fonts.title2, color: 'white', textAlign: 'center'}}>
                Skip Account Security?
              </Text>
            </View>
            <View
              style={{
                paddingTop: 40,
                flexDirection: 'row',
                paddingLeft: 24,
                paddingRight: 24,
                alignItems: 'center',
              }}>
              <CheckBox
                checkedCheckBoxColor={colors.green5}
                checkBoxColor={colors.grey13}
                isChecked={understandNotSecurity}
                onClick={() => {
                  setUnderstandNotSecurity(!understandNotSecurity);
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
                  I understand that if i lose mt seed phrase i will not be able
                  to access my wallet
                </Text>
              </View>
            </View>
            <View
              style={{
                marginTop: 12,
                paddingHorizontal: 24,
                paddingTop: 8,
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}>
              <TextButton
                onPress={() => {
                  setStatus(1);
                }}
                text="Secure Now"
              />
              <PrimaryButton
                onPress={() => {
                  setStatus(4);
                }}
                text="Skip"
                enableFlag={understandNotSecurity}
              />
            </View>
          </View>
        </RBSheet>
        <RBSheet
          height={460}
          ref={refRBSeedPhraseSheet}
          closeOnDragDown={true}
          closeOnPressBack={false}
          closeOnPressMask={false}
          customStyles={{
            wrapper: {
              backgroundColor: '#222531BB',
            },
            draggableIcon: {
              backgroundColor: colors.grey9,
            },
            container: {
              backgroundColor: colors.grey24,
            },
          }}>
          <View>
            <View style={{paddingTop: 12}}>
              <Text
                style={{...fonts.title2, color: 'white', textAlign: 'center'}}>
                What is a 'Seed Phrase'?
              </Text>
            </View>
            <View style={{paddingTop: 24, paddingHorizontal: 24}}>
              <Text
                style={{
                  ...fonts.para_regular,
                  color: 'white',
                  textAlign: 'left',
                }}>
                A seed phrase is a set of twelve words that contains all the
                information about your wallet, including your funds. It's like a
                secret code used to access your entire wallet.{'\n'}You must
                keep your seed phrase secret and safe. If someone gets your seed
                phrase, they'll gain control over your accounts. {'\n'}Save it
                in a place where only you can access it. If you lose it, not
                even MetaMask can help you recover it.
              </Text>
            </View>
            <View style={{paddingTop: 40, paddingHorizontal: 24}}>
              <PrimaryButton
                onPress={() => {
                  if (refRBSeedPhraseSheet && refRBSeedPhraseSheet.current) {
                    refRBSeedPhraseSheet.current.close();
                  }
                }}
                text="I Got It."
              />
            </View>
          </View>
        </RBSheet>

        <View style={{width: '100%', alignItems: 'center'}}>
          <Image source={image} />
        </View>
        <View style={{marginTop: 40, paddingHorizontal: 24}}>
          <View style={{paddingBottom: 16}}>
            <Text
              style={{textAlign: 'center', ...fonts.title2, color: 'white'}}>
              Secure Your Wallet
            </Text>
          </View>
          <View>
            <Text
              style={{
                color: colors.grey9,
                ...fonts.para_regular,
                textAlign: 'left',
              }}>
              Don't risk losing your funds. Protect your wallet by saving your{' '}
              <Text
                style={{color: colors.blue5, ...fonts.para_semibold}}
                onPress={() => {
                  refRBSeedPhraseSheet.current.open();
                }}>
                Seed Phrase
              </Text>{' '}
              in a place you trust.
            </Text>
          </View>
          <View style={{marin: 8}}>
            <Text
              style={{
                color: colors.grey9,
                ...fonts.para_semibold,
                textAlign: 'left',
              }}>
              It's the only way to recover your wallet if you get locked out of
              the app or get a new device.
            </Text>
          </View>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 120,
            width: '90%',
            left: '5%',
          }}>
          <View>
            <TextButton
              onPress={() => {
                refRBSkipSecuritySheet.current.open();
              }}
              text="Remind Me Later"
            />
          </View>
          <View style={{marginTop: 24}}>
            <PrimaryButton
              onPress={() => {
                setStatus(1);
              }}
              text="Start"
            />
          </View>
        </View>
      </View>
    );
  };

  const secureSeedRender = () => {
    return (
      <View style={{width: '100%', paddingTop: 40, height: '100%'}}>
        <RBSheet
          height={360}
          ref={refRBProtectWalletSheet}
          closeOnDragDown={true}
          closeOnPressBack={false}
          closeOnPressMask={false}
          customStyles={{
            wrapper: {
              backgroundColor: '#222531BB',
            },
            draggableIcon: {
              backgroundColor: colors.grey9,
            },
            container: {
              backgroundColor: colors.grey24,
            },
          }}>
          <View>
            <View style={{paddingTop: 12}}>
              <Text
                style={{...fonts.title2, color: 'white', textAlign: 'center'}}>
                Protect Your Wallet
              </Text>
            </View>
            <View style={{paddingTop: 24, paddingHorizontal: 24}}>
              <Text
                style={{
                  ...fonts.para_regular,
                  color: 'white',
                  textAlign: 'left',
                }}>
                Dont’t risk losing your funds. Protect your wallet by saving
                your seed phrase in a place you trust.{'\n'}It’s the only way to
                recover your wallet if you get locked out of the app or get a
                new device.
              </Text>
            </View>
            <View style={{paddingTop: 40, paddingHorizontal: 24}}>
              <PrimaryButton
                onPress={() => {
                  if (
                    refRBProtectWalletSheet &&
                    refRBProtectWalletSheet.current
                  ) {
                    refRBProtectWalletSheet.current.close();
                  }
                }}
                text="I Got It."
              />
            </View>
          </View>
        </RBSheet>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
          }}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}>
            <SvgXml xml={secureWalletTitleSvgXml} />
          </View>
          <View style={{position: 'relative', right: 48}}>
            <SvgXml xml={infoCircleIconSvgXml} />
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: 24,
            marginTop: 16,
          }}>
          <Text style={{...fonts.para_regular, color: colors.grey9}}>
            Secure your wallet's "
            <Text
              style={{color: colors.blue5, ...fonts.para_semibold}}
              onPress={() => {
                refRBProtectWalletSheet.current.open();
              }}>
              Seed Phrase
            </Text>
            "
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 24,
            marginTop: 40,
          }}>
          <View>
            <Text style={{...fonts.para_semibold, color: 'white'}}>Manual</Text>
          </View>
          <View style={{marginTop: 16}}>
            <Text style={{...fonts.para_regular, color: 'white'}}>
              Write down your seed phrase on a piece of paper and store in a
              safe place.
            </Text>
          </View>
          <View style={{marginTop: 16}}>
            <View>
              <Text style={{...fonts.para_regular, color: 'white'}}>
                Security level: Very strong
              </Text>
            </View>
            <View style={{marginTop: 8}}>
              <View style={{flexDirection: 'row'}}>
                <View
                  style={{
                    borderRadius: 4,
                    height: 8,
                    width: 53,
                    marginRight: 8,
                    backgroundColor: colors.green5,
                  }}></View>
                <View
                  style={{
                    borderRadius: 4,
                    height: 8,
                    width: 53,
                    marginRight: 8,
                    backgroundColor: colors.green5,
                  }}></View>
                <View
                  style={{
                    borderRadius: 4,
                    height: 8,
                    width: 53,
                    backgroundColor: colors.green5,
                  }}></View>
              </View>
            </View>
          </View>
          <View style={{marginTop: 16}}>
            <Text style={{...fonts.para_regular, color: 'white'}}>
              Risks are:{'\n'}• You lose it {'\n'}• You forget where you put it{' '}
              {'\n'}• Someone else finds it
            </Text>
          </View>
          <View style={{marginTop: 16}}>
            <Text style={{...fonts.para_regular, color: 'white'}}>
              Other options doesn't have to be paper!
            </Text>
          </View>
          <View style={{marginTop: 16}}>
            <Text style={{...fonts.para_regular, color: 'white'}}>
              Tips:{'\n'}• Store in bank vault
              {'\n'}• Store in a safe
              {'\n'}• Store in multiple secret places
            </Text>
          </View>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 120,
            width: '90%',
            left: '5%',
          }}>
          <PrimaryButton
            onPress={() => {
              setStatus(2);
            }}
            text="Start"
          />
        </View>
      </View>
    );
  };

  const writeSeedRender = () => {
    return (
      <View style={{width: '100%', paddingTop: 40, height: '100%'}}>
        <View style={{alignItems: 'center', paddingHorizontal: 24}}>
          <SvgXml xml={writeSeedTitleSvgXml} />
        </View>
        <View style={{marginTop: 16, paddingHorizontal: 24}}>
          <Text style={{...fonts.para_regular, color: colors.grey9}}>
            This is your seed phrase. Write it down on a paper and keep it in a
            safe place. You'll be asked to re-enter this phrase (in order) on
            the next step.
          </Text>
        </View>
        <View
          style={{
            marginTop: 40,
            marginHorizontal: 24,
            padding: 24,
            borderRadius: 8,
            borderColor: colors.grey22,
            borderWidth: 1,
          }}
          ref={backgroundImageRef}
          onLoadEnd={() => {
            // Workaround for a tricky race condition on initial load
            InteractionManager.runAfterInteractions(() => {
              setTimeout(() => {
                setViewRef(findNodeHandle(backgroundImageRef.current));
              }, 500);
            });
          }}>
          {mnemonic.map((item, index) => {
            if (index < 6) {
              return (
                <View
                  key={'mnemonic_' + index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginBottom: 16,
                  }}>
                  <View
                    style={{
                      backgroundColor: colors.grey22,
                      borderRadius: 8,
                      height: 32,
                      width: 140,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        ...fonts.para_regular,
                        textAlign: 'center',
                      }}>
                      {(index + 1).toString() + '. ' + item}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: colors.grey22,
                      borderRadius: 8,
                      height: 32,
                      width: 140,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        ...fonts.para_regular,
                        textAlign: 'center',
                      }}>
                      {(index + 7).toString() + '. ' + mnemonic[index + 6]}
                    </Text>
                  </View>
                </View>
              );
            }
          })}
          {!showSeed && (
            <>
              <BlurView
                viewRef={viewRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  right: 0,
                }}
                blurType="light"
                overlayColor={'rgba(0, 0, 255, 0)'}
              />
              <View
                style={{
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: screenWidth - 48,
                  height: 336,
                }}>
                <View>
                  <View>
                    <Text
                      style={{
                        color: 'white',
                        ...fonts.para_semibold,
                        textAlign: 'center',
                      }}>
                      Tap to reveal your seed phrase
                    </Text>
                  </View>
                  <View style={{marginTop: 16}}>
                    <Text
                      style={{
                        color: colors.grey9,
                        ...fonts.para_regular,
                        textAlign: 'center',
                      }}>
                      Make sure no one is watching your screen.
                    </Text>
                  </View>
                </View>
                <View style={{marginTop: 40}}>
                  <SecondaryButton
                    onPress={() => {
                      setShowSeed(true);
                    }}
                    text="View"
                    icon={
                      <FontAwesome
                        style={{
                          fontSize: 16,
                          color: colors.green5,
                          marginRight: 12,
                        }}
                        icon={RegularIcons.eye}
                      />
                    }
                  />
                </View>
              </View>
            </>
          )}
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 120,
            width: '90%',
            left: '5%',
          }}>
          <PrimaryButton
            onPress={() => {
              setStatus(3);
              setShowSeed(false);
            }}
            text="Next"
            enableFlag={showSeed}
          />
        </View>
      </View>
    );
  };

  const confirmSeedRender = () => {
    return (
      <ConfirmSeedScreen
        successCallback={() => {
          setStatus(4);
        }}
        mnemonic={mnemonic}
      />
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
        {createWalletHeaderRender()}
        {status === 0 && secureWalletRender()}
        {status === 1 && secureSeedRender()}
        {status === 2 && writeSeedRender()}
        {status === 3 && confirmSeedRender()}
        {status === 4 && successRender()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
  createWallet: (data, beforeWork, successCallback, failCallback) =>
    createWallet(dispatch, data, beforeWork, successCallback, failCallback),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateWalletScreen);
