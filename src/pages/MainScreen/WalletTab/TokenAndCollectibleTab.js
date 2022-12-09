import React, {useEffect, useState, useMemo, createRef, useRef} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Dimensions,
  Pressable,
  Animated,
  ScrollView,
  Text,
} from 'react-native';
import {colors, fonts} from '../../../styles';
import {SvgXml} from 'react-native-svg';
import FontAwesome, {
  SolidIcons,
  RegularIcons,
  BrandIcons,
} from 'react-native-fontawesome';
import {TabView, SceneMap} from 'react-native-tab-view';
import {useColorModeValue} from 'native-base';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();

import {TextButton} from '../../../components/Buttons';

import TokenItemRow from './TokenItemRow';
import CollectibleItemRow from './CollectibleItemRow';
import {
  getTokensList,
  setSelectedToken,
} from '../../../redux/actions/TokensActions';
import TokenAdd from './TokenAdd/TokenAdd';
import RBSheet from 'react-native-raw-bottom-sheet';
import CollectibleAdd from './CollectibleAdd';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NftTokenRow from '../../../components/NftTokenRow';
import {GOERLI, MAINNET} from '../../../engine/constants';
import HistoryRow from '../../../components/HistoryRow';

const screenHeight = Dimensions.get('screen').height;

// // Setup: npm install alchemy-sdk
// import { Alchemy, Network } from "alchemy-sdk";

// const config = {
//   apiKey: "7vqFbz6_rvbEVu_B0vS2z3EFgJ_5hso0",
//   network: Network.ETH_GOERLI,
// };
// const alchemy = new Alchemy(config);

// const data = await alchemy.core.getAssetTransfers({
//   fromBlock: "0x0",
//   fromAddress: "0x5c43B1eD97e52d009611D89b74fA829FE4ac56b1",
//   category: ["external", "internal", "erc20", "erc721", "erc1155"],
// });

// console.log(data);

const TokenAndCollectiblesTab = ({
  navigation,
  currentNetwork,
  accounts,
  currentAccountIndex,
  tokens,
  setSelectedToken,
  nftBalancesInfo,
  networks,
}) => {
  const [curTabIndex, setCurTabIndex] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const refRBTokenAddSheet = useRef(null);
  const refRBCollectibleAddSheet = useRef(null);
  const currentAddress = accounts[currentAccountIndex].address;

  // useEffect(() => {
  //   AsyncStorage.setItem('nftbalances_info', JSON.stringify({}));
  // });

  useEffect(() => {
    getTransactions();
  }, []);

  const getTransactions = () => {
    let data = JSON.stringify({
      jsonrpc: '2.0',
      id: 0,
      method: 'alchemy_getAssetTransfers',
      params: [
        {
          fromBlock: '0x0',
          fromAddress: currentAddress,
          category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
        },
      ],
    });

    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: data,
      redirect: 'follow',
    };

    const apiKey = '7vqFbz6_rvbEVu_B0vS2z3EFgJ_5hso0';
    let baseURL;
    if (currentNetwork == MAINNET) {
      baseURL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
    } else if (currentNetwork == GOERLI) {
      baseURL = `https://eth-goerli.g.alchemy.com/v2/${apiKey}`;
    } else {
      baseURL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
    }
    const fetchURL = `${baseURL}`;
    fetch(fetchURL, requestOptions)
      .then(response => response.json())
      .then(result =>
        console.log(setTransactions(result.result.transfers.slice(0, 15))),
      )
      .catch(error => console.log('error', error));
  };

  const [tabRoutes] = useState([
    {
      key: 'first',
      title: 'Token',
    },
    {
      key: 'second',
      title: 'History',
    },
  ]);

  const renderTokenAdd = () => {
    return (
      <RBSheet
        height={screenHeight - 100}
        ref={refRBTokenAddSheet}
        closeOnDragDown={true}
        closeOnPressBack={true}
        closeOnPressMask={true}
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
        <TokenAdd
          onCancel={() => {
            refRBTokenAddSheet.current.close();
          }}
        />
      </RBSheet>
    );
  };

  const renderCollectibleAdd = () => {
    return (
      <RBSheet
        height={450}
        ref={refRBCollectibleAddSheet}
        closeOnDragDown={true}
        closeOnPressBack={true}
        closeOnPressMask={true}
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
        <CollectibleAdd
          onCancel={() => {
            if (refRBCollectibleAddSheet)
              refRBCollectibleAddSheet.current.close();
          }}
        />
      </RBSheet>
    );
  };

  const TokenRoute = () => {
    const tokensList = tokens[currentNetwork]
      ? tokens[currentNetwork][currentAccountIndex]
        ? tokens[currentNetwork][currentAccountIndex].tokensList
        : []
      : [];
    return (
      <View style={{flex: 1}}>
        <ScrollView nestedScrollEnabled={true}>
          <TokenItemRow
            token={'main'}
            removable={false}
            onPress={() => {
              // setSelectedToken('main');
              // navigation.navigate('tokenshow');
            }}
          />
          {tokensList.map(token => {
            return (
              <TokenItemRow
                token={token}
                onPress={() => {
                  setSelectedToken(token);
                  navigation.navigate('tokenshow');
                }}
                removable={true}
                key={'tokenRoute_' + token.tokenAddress}
              />
            );
          })}
        </ScrollView>
        {/* <View style={{ marginTop: 24 }}>
          <TextButton
            text="Import Tokens"
            onPress={() => {
              refRBTokenAddSheet.current.open();
            }}
            icon={
              <FontAwesome
                style={{ fontSize: 24, color: colors.primary5, marginRight: 12 }}
                icon={SolidIcons.plusCircle}
              />
            }
          />
        </View> */}
      </View>
    );
  };

  const HistoryRoute = () => {
    // const nftTokenList = nftBalancesInfo[currentNetwork.toString()]
    //   ? nftBalancesInfo[currentNetwork.toString()][
    //     currentAccountIndex.toString()
    //   ]
    //     ? nftBalancesInfo[currentNetwork.toString()][
    //       currentAccountIndex.toString()
    //     ].tokensList
    //     : []
    //   : [];
    // console.log(nftTokenList);
    console.log({transactions});
    return (
      <View style={{flex: 1}}>
        <ScrollView style={{marginTop: 40, marginHorizontal: 24}}>
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => {
              return (
                <HistoryRow
                  key={index}
                  transactionType={
                    transaction.from == currentAddress ? 'sent' : 'received'
                  }
                  resultType="confirmed"
                  totalAmount={transaction.value}
                  unit={transaction.asset}
                  from={transaction.from}
                  to={transaction.to}
                  nonce="#0"
                />
              );
            })
          ) : (
            <Text style={{color: 'white'}}>No transactions</Text>
          )}
        </ScrollView>
        {/* <View style={{ marginTop: 24, flexDirection: 'column-reverse', flex: 1 }}>
          <TextButton
            text="Import Collectibles"
            onPress={() => {
              refRBCollectibleAddSheet.current.open();
            }}
            icon={
              <FontAwesome
                style={{ fontSize: 24, color: colors.primary5, marginRight: 12 }}
                icon={SolidIcons.plusCircle}
              />
            }
          />
        </View> */}
      </View>
    );
  };

  const initialLayout = {
    width: Dimensions.get('window').width,
  };
  const renderScene = SceneMap({
    first: TokenRoute,
    second: HistoryRoute,
  });

  const renderTabBar = props => {
    const inputRange = props.navigationState.routes.map((x, i) => i);
    return (
      <View style={{flexDirection: 'row'}}>
        {props.navigationState.routes.map((route, i) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map(inputIndex =>
              inputIndex === i ? 1 : 0.5,
            ),
          });
          const color =
            curTabIndex === i
              ? useColorModeValue('white', colors.grey12)
              : useColorModeValue(colors.grey12, colors.grey12);

          return (
            <View
              key={'tokenandcollectibletabbar_' + i}
              style={{
                marginHorizontal: 24,
                borderBottomWidth: curTabIndex === i ? 3 : 0,
                borderColor: 'white',
                flex: 1,
                alignItems: 'center',
              }}>
              <Pressable
                onPress={() => {
                  setCurTabIndex(i);
                }}>
                <Animated.Text
                  style={{
                    color,
                  }}>
                  {route.title}
                </Animated.Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={{height: 500}}>
      {renderTokenAdd()}
      {renderCollectibleAdd()}
      <TabView
        style={{marginVertical: 40, marginHorizontal: 24}}
        navigationState={{index: curTabIndex, routes: tabRoutes}}
        renderTabBar={renderTabBar}
        renderScene={renderScene}
        onIndexChange={setCurTabIndex}
        initialLayout={initialLayout}
      />
    </View>
  );
};

const mapStateToProps = state => ({
  networks: state.networks.networks,
  currentNetwork: state.networks.currentNetwork,
  accounts: state.accounts.accounts,
  currentAccountIndex: state.accounts.currentAccountIndex,
  tokens: state.tokens.tokensData,
  nftBalancesInfo: state.nftBalances,
});
const mapDispatchToProps = dispatch => ({
  getTokensList: (currentNetwork, currentAccountIndex, successCallback) =>
    getTokensList(
      dispatch,
      currentNetwork,
      currentAccountIndex,
      successCallback,
    ),
  setSelectedToken: token => setSelectedToken(dispatch, token),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TokenAndCollectiblesTab);
