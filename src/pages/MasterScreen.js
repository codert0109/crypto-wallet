import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';

import {PrimaryButton, SecondaryButton} from '../components/Buttons';
import {fonts, colors} from '../styles';
import {Avatar} from 'react-native-elements';
import {isValidAddress} from '../utils/common';
import {setMasterAddressToChain} from '../utils/metadata';
const avatars = require('../constants').default.avatars;

//import images

const MasterScreen = ({navigation, accounts}) => {
  const [stage, setStage] = useState(0);
  const [toAddress, setToAddress] = useState(null);
  const [masterAddress, setMasterAddress] = useState(null);
  const [canClick, setCanClick] = useState(false);
  const [loading, setLoading] = useState(false);

  const onPressSet = async () => {
    setLoading(true);
    const isSuccess = await setMasterAddressToChain(
      toAddress,
      masterAddress,
      // () => {
      //   setLoading(false);
      //   Alert.alert('Success');
      //   navigation.navigate('mainscreen');
      // },
      // () => {
      //   Alert.alert('Failed');
      //   setLoading(false);
      // },
    );
    if (isSuccess) {
      setLoading(false);
      Alert.alert('Success');
      navigation.navigate('mainscreen');
    } else {
      Alert.alert('Failed');
      setLoading(false);
    }
  };

  const renderAccountRow = ({
    accountName,
    accountAddress,
    accountIcon,
    onPress,
    selected,
    hasKey,
  }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        key={
          typeof hasKey === 'boolean' && hasKey === true
            ? 'renderAccountRowinsendtoken_' + accountAddress
            : Math.random().toString()
        }>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.grey23,
                marginRight: 16,
              }}>
              <View style={{position: 'absolute', left: 0, top: 0}}>
                {accountIcon}
              </View>
            </View>
            <View>
              <View>
                <Text style={{...fonts.title2, color: 'white'}}>
                  {accountName}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    ...fonts.caption_small12_18_regular,
                    color: colors.grey9,
                  }}>
                  {accountAddress.slice(0, 6) +
                    '...' +
                    accountAddress.slice(-4)}
                </Text>
              </View>
            </View>
            {selected && (
              <View style={{flex: 1, flexDirection: 'row-reverse'}}>
                <FontAwesome
                  style={{fontSize: 16, color: colors.green5}}
                  icon={RegularIcons.checkCircle}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const selectAddressStage = () => {
    return (
      <View>
        <Text style={{fontSize: 20, color: 'white', textAlign: 'center'}}>
          Select Address
        </Text>
        <View style={{marginTop: 24, marginHorizontal: 24}}>
          {accounts.map(account =>
            renderAccountRow({
              accountName: account.name,
              accountAddress: account.address,
              accountIcon: (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.grey23,
                  }}>
                  <View style={{position: 'absolute', left: 0, top: 0}}>
                    <Avatar rounded source={avatars[account.icon]} size={24} />
                  </View>
                </View>
              ),
              onPress: () => {
                setToAddress(account.address);
                setStage(1);
              },
            }),
          )}
        </View>
        <View style={{height: 15}}></View>
        <PrimaryButton
          onPress={() => {
            onPressSet();
          }}
          loading={loading}
          style={{marginTop: 30}}
          text="Skip and set your current address as master address"
        />
      </View>
    );
  };

  const selectMasterAddressStage = () => {
    return (
      <View>
        <Text style={{fontSize: 20, color: 'white', textAlign: 'center'}}>
          Select Master Address
        </Text>
        <View style={{marginTop: 24, marginHorizontal: 24}}>
          {accounts.map(account =>
            renderAccountRow({
              accountName: account.name,
              accountAddress: account.address,
              accountIcon: (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.grey23,
                  }}>
                  <View style={{position: 'absolute', left: 0, top: 0}}>
                    <Avatar rounded source={avatars[account.icon]} size={24} />
                  </View>
                </View>
              ),
              onPress: () => {
                setMasterAddress(account.address);
                setCanClick(true);
              },
            }),
          )}
        </View>
        <View style={{height: 15}}></View>
        <View>
          <TextInput
            style={{
              padding: 16,
              height: 64,
              color: 'black',
              ...fonts.para_semibold,
              width: Dimensions.get('screen').width - 48,
              backgroundColor: 'white',
              borderRadius: 6,
            }}
            placeholder={'Input master address (0x)'}
            placeholderTextColor={colors.grey12}
            value={masterAddress}
            onChangeText={value => {
              setMasterAddress(value);
              if (isValidAddress(value)) {
                setCanClick(true);
              } else {
                setCanClick(false);
              }
            }}
          />
        </View>
        <PrimaryButton
          enableFlag={canClick}
          onPress={() => {
            onPressSet();
          }}
          loading={loading}
          style={{marginTop: 30}}
          text="Set Master Address"
        />
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
        <ScrollView>
          <View
            style={{
              marginTop: 30,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
            }}>
            <Image
              resizeMode="center"
              height={150}
              width={100}
              source={require('../assets/images/through/image4.png')}
            />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              marginTop: 20,
              marginHorizontal: 24,
            }}>
            {stage == 0 && selectAddressStage()}
            {stage == 1 && selectMasterAddressStage()}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const mapStateToProps = state => ({
  accounts: state.accounts.accounts,
});
const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(MasterScreen);
