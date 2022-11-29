import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';
import RNSimData from 'react-native-sim-data';
import DeviceInfo from 'react-native-device-info';
import SmsRetriever from 'react-native-sms-retriever';

const IMEI = require('react-native-imei');

import Constants from '../constants';

const Wallet = require('ethereumjs-wallet').default;
const util = require('ethereumjs-util');
const CryptoJS = require('crypto-js');
var Web3 = require('web3');

// Import the ethers library
import {ethers, utils} from 'ethers';
import {store} from '../redux/store';
import setupABI from '../abis/setup.json';

export const generatePKCEdata = async () => {
  const accounts_info_json = await AsyncStorage.getItem('accounts_info');
  if (accounts_info_json) {
    const accounts_info = JSON.parse(accounts_info_json);
    const account = accounts_info.accounts[1];
    const privateKey = account.privateKey;
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const wallet = Wallet.fromPrivateKey(privateKeyBuffer);
    const publicKey = wallet.getPublicKey();
    const address = '0x' + wallet.getAddress().toString('hex');
    const algorithm_type = Constants.algorithm_type;
    const uId = await DeviceInfo.getAndroidId();
    const phone_number = await DeviceInfo.getPhoneNumber();
    const currentNetwork = store.getState().networks.currentNetwork;
    const network = store.getState().networks.networks[currentNetwork];
    const publicKeyEncoded = btoa(JSON.stringify(publicKey));
    const metadataEncoded = btoa(
      JSON.stringify({
        algorithm_type,
        address,
        publicKeyEncoded,
        imei: uId,
        iccid: phone_number,
      }),
    );
    // Encrypt
    const publickeyEncrypted = CryptoJS.AES.encrypt(
      publicKeyEncoded,
      privateKey,
    ).toString();
    const metadataEncrypted = CryptoJS.AES.encrypt(
      metadataEncoded,
      privateKey,
    ).toString();

    // // Decrypt
    // var bytes = CryptoJS.AES.decrypt(metadata, privateKey);
    // var originalText = bytes.toString(CryptoJS.enc.Utf8);

    // console.log(originalText); // 'my message'

    const provider = new ethers.providers.JsonRpcProvider(network.rpc);
    // await provider.send('eth_requestAccounts', []);
    const _wallet = new ethers.Wallet(privateKey, provider);
    const signer = _wallet.provider.getSigner(_wallet.address);
    const setupContract = new ethers.Contract(
      Constants.setupContractAddress,
      setupABI,
      signer,
    );
    // const web3 = new Web3(
    //   new Web3.providers.HttpProvider('https://mainnet.infura.io/'),
    // );
    // const NameContract = web3.eth.Contract(
    //   Constants.setupContractAddress,
    //   setupABI,
    // );
    // const temp = NameContract.methods.getMetadata();
    // console.log('te', temp);
    const publicKeyBytes = util.fromAscii(publickeyEncrypted);
    const metadataBytes = util.fromAscii(metadataEncrypted);
    // setupContract.setMetadata(address, [metadataBytes]).then(e => console.log(e)).catch(e => console.log('error', e.reason));
    setupContract.getMetadata(address).then(e => console.log(e)).catch(e => console.log('error', e.reason));
    // console.log(str); // "0x657468657265756d"
    // const contractWithSigner = setupContract.connect(_wallet);
    // const tx = await contractWithSigner.setMetadata(address, [metadataBytes]);
    // const tx = await contractWithSigner.getMetadata(address);
    // console.log('hash', tx);
    // await tx.wait();
    // console.log(address, [metadataBytes]);
    // const txn =  await setupContract.populateTransaction.setMetadata(address, [metadataBytes]);
    // let txnHash;
    // try {
    //   txnHash = _wallet.sendTransaction(txn).then((r) => {console.log(r)}).catch(err=> {console.log(err)});
    // } catch(err) {
    //   console.log(err.reason);
    // }
  } else {
    console.log('Failed to create PKCE data');
    return false;
  }
};
