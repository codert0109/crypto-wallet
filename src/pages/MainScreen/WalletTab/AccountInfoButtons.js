import React from 'react';
import {connect} from 'react-redux';
import {Text, View, TouchableOpacity} from 'react-native';

// import styls
import {fonts, colors} from '../../../styles';
import {SvgXml} from 'react-native-svg';
import {CommonButton} from '../../../components/Buttons';

const stakingButtonImage = require('../../../assets/images/wallettab/staking.png');

const AccountInfoButtons = ({
  navigation,
  accounts,
  currentAccountIndex,
  networks,
  currentNetwork,
  onSend,
  onReceive,
  onBuy,
}) => {
  const renderTopButton = ({icon, text, onPress}) => {
    return (
      <TouchableOpacity
        style={{width: 72, marginHorizontal: 4, alignItems: 'center'}}>
        <TouchableOpacity
          onPress={onPress}
          style={{backgroundColor: colors.P3, padding: 14, borderRadius: 6}}>
          {icon}
        </TouchableOpacity>
        <Text
          style={{
            textAlign: 'center',
            marginTop: 8,
            ...fonts.BODY_T3,
            color: 'white',
          }}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        marginTop: 24,
        paddingHorizontal: 6,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}>
      {renderTopButton({
        icon: <SvgXml xml={fonts.topSendButtonSvgXml} />,
        text: 'Send',
        onPress: onSend,
      })}
      {renderTopButton({
        icon: <SvgXml xml={fonts.topReceiveButtonSvgXml} />,
        text: 'Receive',
        onPress: onReceive,
      })}
      {renderTopButton({
        icon: <SvgXml xml={fonts.topBuyButtonSvgXml} />,
        text: 'Buy',
        onPress: onBuy,
      })}
    </View>
  );
};

const mapStateToProps = state => ({
  accounts: state.accounts.accounts,
  currentAccountIndex: state.accounts.currentAccountIndex,
  networks: state.networks.networks,
  currentNetwork: state.networks.currentNetwork,
});
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AccountInfoButtons);
