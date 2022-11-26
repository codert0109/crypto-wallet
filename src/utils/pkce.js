import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';
import RNSimData from 'react-native-sim-data';
const IMEI = require('react-native-imei');

import Constants from '../constants';

const Wallet = require('ethereumjs-wallet').default;
const util = require('ethereumjs-util');

// Import the ethers library
import {ethers, utils} from 'ethers';
import {store} from '../redux/store';
import setupABI from '../abis/setup.json';

export const generatePKCEdata = async () => {
  const accounts_info_json = await AsyncStorage.getItem('accounts_info');
  if (accounts_info_json) {
    const accounts_info = JSON.parse(accounts_info_json);
    const account = accounts_info.accounts[0];
    const privateKey = account.privateKey;
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    // const publicKey = util.privateToPublic(privateKeyBuffer)
    const wallet = Wallet.fromPrivateKey(privateKeyBuffer);
    const publicKey = wallet.getPublicKey();
    const address = '0x' + wallet.getAddress().toString('hex');
    const algorithm_type = Constants.algorithm_type;
    const imeiList = await IMEI.getImei();
    const phone_number = RNSimData.getTelephoneNumber();
    const currentNetwork = store.getState().networks.currentNetwork;
    const network = store.getState().networks.networks[currentNetwork];
    const publicKeyHash = btoa(JSON.stringify(publicKey));
    const metadataHash = btoa(JSON.stringify({
      algorithm_type,
      address,
      publicKeyHash,
      imeiList,
      phone_number
    }))
    console.log('metadata', atob(metadataHash));
    const provider = new ethers.providers.JsonRpcProvider(
      network.rpc,
    );
    const setupContract = new ethers.Contract(
      Constants.setupContractAddress,
      setupABI,
      provider,
    );
    setupContract
      .setMetadata(metadataHash)
      .then(() => {
        console.log('success');
      })
      .catch(err => {
        console.log('Check Owner Ship ERROR: ', err);
      });
  } else {
    console.log('Failed to create PKCE data');
    return false;
  }
};
