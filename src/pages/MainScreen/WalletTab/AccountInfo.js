import React from 'react';
import { connect } from 'react-redux';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import AccountInfoButtons from './AccountInfoButtons';

// import utils
import Clipboard from '@react-native-clipboard/clipboard';

// import constats
import constants from '../../../constants'

// import styls
import { fonts, colors } from '../../../styles'
import { SvgXml } from 'react-native-svg';
import { CommonButton } from '../../../components/Buttons';

const stakingButtonImage = require('../../../assets/images/wallettab/staking.png')

const AccountInfo = ({
    navigation,
    accounts,
    currentAccountIndex,
    networks,
    currentNetwork,
    onSend,
    onReceive,
    onBuy,
}) => {
    const currentNetworkSymbol = networks[currentNetwork].symbol;
    const currentAccount = accounts[currentAccountIndex];

    const renderTopButton = ({ icon, text, onPress }) => {
        return <TouchableOpacity style={{ width: 72, marginHorizontal: 4, alignItems: 'center' }}>
            <TouchableOpacity onPress={onPress} style={{ backgroundColor: colors.P3, padding: 14, borderRadius: 6 }}>
                {icon}
            </TouchableOpacity>
            <Text style={{ textAlign: 'center', marginTop: 8, ...fonts.BODY_T3, color: 'white' }}>{text}</Text>
        </TouchableOpacity>
    }

    return (
        <View style={{ marginHorizontal: 24, marginTop: 24, }}>
            <View style={{ alignItems: 'center' }}>
                <Image
                    source={constants.avatars[0]}
                    style={{
                        width: 48,
                        height: 48,
                    }}
                />
            </View>
            <View style={{ position: 'absolute' }}>
                <Text style={{
                    ...fonts.BODY_T3, color: '#FFFFFF', opacity: 0.5
                }}>{currentAccount?.name}</Text>
            </View>
            <View style={{ marginTop: 24, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{
                    ...fonts.BODY_T2, color: 'white', marginRight: 8
                }}>
                    {currentAccount.address.slice(0, 6) + "..." + currentAccount.address.slice(-4)}
                </Text>
                <TouchableOpacity onPress={() => {
                    Clipboard.setString(currentAccount.address || "")
                }}>
                    <SvgXml xml={fonts.addressCopySvgXml} />
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: 24 }}></View>
            <AccountInfoButtons onSend={onSend} onReceive={onReceive} onBuy={onBuy} />
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

export default connect(mapStateToProps, mapDispatchToProps)(AccountInfo);
