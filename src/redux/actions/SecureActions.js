import {SET_INITIAL_ACCOUNT_DATA} from '../types';
import bcrypt from 'bcrypt-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from '../../constants';

// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

// Import the ethers library
import {ethers} from 'ethers';

import {createInitialAccountFromMasterSeed} from '../../utils/account';

import {initialSettings, NetworkList, RINKEBY} from '../../engine/constants';

export const createSecure = (
  dispatch,
  data,
  beforeWork,
  successCallback,
  failCallback,
) => {
  beforeWork();

  console.log('1')
  bcrypt
    .getSalt(Constants.saltRound)
    .then(salt => {
      console.log('2')
      const {password, mnemonic, isFingerPrintUsed, pinCode} = data;
      const masterSeedString = ethers.utils.mnemonicToSeed(mnemonic).slice(2);
      const masterSeed = Buffer.from(masterSeedString, 'hex');
      bcrypt
        .hash(salt, password)
        .then(hash => {
          const initialAccountData =
            createInitialAccountFromMasterSeed(masterSeed);
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
          console.log('3')
          let tokensInfo = {};
          networkKeys.forEach(key => {
            tokensInfo[key] = {
              [initialAccountData.address]: {
                tokensList: [],
              },
            };
          });
          console.log('4')
          const storingTokensInfo = {
            tokensData: tokensInfo,
            selectedToken: 'main',
          };
          console.log('5')
          AsyncStorage.multiSet([
            ['password', hash],
            ['mnemonic', mnemonic],
            ['isFingerPrintUsed', JSON.stringify(isFingerPrintUsed)],
            ['pinCode', JSON.stringify(pinCode)],
            ['master_seed', masterSeedString],
            ['accounts_info', JSON.stringify(accountsInfo)],
            ['networks_info', JSON.stringify(networksInfo)],
            ['balances_info', JSON.stringify(balancesInfo)],
            ['tokens_info', JSON.stringify(storingTokensInfo)],
            ['settings_info', JSON.stringify(initialSettings)],
          ])
            .then(() => {
              console.log('6')
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
        })
        .catch(err => {
          console.log('Wallet Actions: ERROR!!: ', err);
          failCallback();
        });
    })
    .catch(err => {
      console.log('Wallet Actions: ERROR!!!', err);
      failCallback();
    });
    
};

export const testAction = dispatch => {
  dispatch({type: 'test', payload: 'test'});
};
