import {SET_INITIAL_ACCOUNT_DATA} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

// Import the ethers library
import {ethers} from 'ethers';

import {createInitialAccountFromMasterSeed} from '../../utils/account';

import {initialSettings, NetworkList, RINKEBY} from '../../engine/constants';

export const createWallet = (
  dispatch,
  data,
  beforeWork,
  successCallback,
  failCallback,
) => {
  beforeWork();

  const {mnemonic} = data;
  const masterSeedString = ethers.utils.mnemonicToSeed(mnemonic).slice(2);
  const masterSeed = Buffer.from(masterSeedString, 'hex');
  const initialAccountData = createInitialAccountFromMasterSeed(masterSeed);
  const accountsInfo = {
    accounts: [initialAccountData],
    currentAccountIndex: 0,
  };
  const networksInfo = {
    networks: NetworkList,
    currentNetwork: RINKEBY,
  };
  const balancesInfo = {
    [initialAccountData.address]: {main: '0'},
  };
  const networkKeys = Object.keys(NetworkList);
  let tokensInfo = {};
  networkKeys.forEach(key => {
    tokensInfo[key] = {
      [initialAccountData.address]: {
        tokensList: [],
      },
    };
  });
  const storingTokensInfo = {
    tokensData: tokensInfo,
    selectedToken: 'main',
  };
  AsyncStorage.multiSet([
    ['mnemonic', mnemonic],
    ['master_seed', masterSeedString],
    ['accounts_info', JSON.stringify(accountsInfo)],
    ['networks_info', JSON.stringify(networksInfo)],
    ['balances_info', JSON.stringify(balancesInfo)],
    ['tokens_info', JSON.stringify(storingTokensInfo)],
    ['settings_info', JSON.stringify(initialSettings)],
  ])
    .then(() => {
      dispatch({
        type: SET_INITIAL_ACCOUNT_DATA,
        payload: initialAccountData,
      });
      successCallback();
    })
    .catch(err => {
      console.log('Wallet Actions: ERROR!: ', err);
      failCallback();
    });
};
