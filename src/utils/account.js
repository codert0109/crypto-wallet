const hdkey = require('ethereumjs-wallet').hdkey;
// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

// Import the ethers library
import {ethers} from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import constants from '../constants';
const util = require('ethereumjs-util');
const avatarsCount = require('../constants').default.avatarsCount;

const createInitialAccountFromMasterSeed = masterSeed => {
  let path = "m/44'/60'/" + 0 + "'/" + 0 + "'/" + 0;
  let hdwallet = hdkey.fromMasterSeed(masterSeed);
  let wallet = hdwallet.derivePath(path).getWallet();
  let address = '0x' + wallet.getAddress().toString('hex');
  let privateKey = wallet.getPrivateKey().toString('hex');
  return {
    name: 'Account 1',
    privateKey,
    address,
    icon: 0,
    path,
    index: 0,
    isImported: false,
    metadata_status: constants.metadata_status.INITIAL
  };
};

const generateNewAccount = (masterSeed, path, accountName, index) => {
  let hdwallet = hdkey.fromMasterSeed(masterSeed);
  let wallet = hdwallet.derivePath(path).getWallet();
  let address = '0x' + wallet.getAddress().toString('hex');
  let privateKey = wallet.getPrivateKey().toString('hex');
  return {
    name: accountName,
    privateKey,
    address,
    icon: Math.floor(Math.random() * avatarsCount) % avatarsCount,
    path,
    index,
    isImported: false,
    metadata_status: constants.metadata_status.INITIAL
  };
};

const generateAccountFromPrivateKey = ({privateKey, accountName, index}) => {
  let address = ethers.utils.computeAddress('0x' + privateKey);
  return {
    name: accountName,
    privateKey,
    address,
    icon: Math.floor(Math.random() * avatarsCount) % avatarsCount,
    index,
    isImported: true,
    metadata_status: constants.metadata_status.INITIAL
  };
};

const getCurrentPublicKeyFromStorage = async () => {
  const accounts_info = await AsyncStorage.getItem('accounts_info');
  const accounts_info_json = JSON.parse(accounts_info);
  const {accounts, currentAccountIndex} = accounts_info_json;
  const currentAccountPublicKey = util.privateToPublic(
    Buffer.from(accounts[currentAccountIndex].privateKey, 'hex'),
  );
  const currentAccountPublicKeyEncoded = btoa(
    JSON.stringify(currentAccountPublicKey),
  );
  return currentAccountPublicKeyEncoded;
};

export {
  createInitialAccountFromMasterSeed,
  generateNewAccount,
  generateAccountFromPrivateKey,
  getCurrentPublicKeyFromStorage,
};
