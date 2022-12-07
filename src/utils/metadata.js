import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';
import DeviceInfo from 'react-native-device-info';
import Constants from '../constants';

const Wallet = require('ethereumjs-wallet').default;
const util = require('ethereumjs-util');
const CryptoJS = require('crypto-js');
const Web3 = require('web3');

// Import the ethers library
import {ethers, utils} from 'ethers';
import {store} from '../redux/store';
import setupABI from '../abis/setup.json';

export const generateMetadata = async () => {
  const returnData = {
    success: false,
    error: null,
    hash: null
  };
  const accounts_info_json = await AsyncStorage.getItem('accounts_info');
  if (accounts_info_json) {
    const accounts_info = JSON.parse(accounts_info_json);
    let currentAccountIndex = store.getState().accounts.currentAccountIndex;
    if(typeof currentAccountIndex == undefined) {
      currentAccountIndex = 0;
    }
    const account = accounts_info.accounts[currentAccountIndex];
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
        hash_type: algorithm_type,
        eth_address: address,
        public_key_encoded: publicKeyEncoded,
        imei: uId,
        iccid: phone_number,
      }),
    );
    // Encrypt
    // const publickeyEncrypted = CryptoJS.AES.encrypt(
    //   publicKeyEncoded,
    //   privateKey,
    // ).toString();
    const metadataEncrypted = CryptoJS.AES.encrypt(
      metadataEncoded,
      publicKeyEncoded,
    ).toString();

    // // Decrypt
    // var bytes = CryptoJS.AES.decrypt(metadata, privateKey);
    // var originalText = bytes.toString(CryptoJS.enc.Utf8);

    // console.log(originalText); // 'my message'
    const provider = new ethers.providers.JsonRpcProvider(network.rpc);
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
    const publicKeyBytes = util.fromAscii(publicKeyEncoded);
    const metadataBytes = util.fromAscii(metadataEncrypted);
    try {
      const nTx = await setupContract.populateTransaction.setMetadata(
        address,
        [metadataBytes],
      );
      const nTx2 = await setupContract.populateTransaction.setPubKey(
        address,
        [publicKeyBytes],
      );
      const txn = await _wallet.sendTransaction(nTx);
      const txn2 = await _wallet.sendTransaction(nTx2);
      if (txn.hash && txn2.hash) {
        returnData.success = true;
        returnData.hash = txn2.hash;
        return returnData;
      } else {
        returnData.success = false;
        returnData.error = 'Can not set data to blockchain.';
        return returnData;
      }
    } catch (e) {
      console.log('error in writing to blockchain', (e.data));
      returnData.success = false;
      returnData.error = e;
      return returnData;
    }

    // setupContract.setMetadata(address, [metadataBytes]).then(e => console.log(e)).catch(e => console.log('error', e.reason));
    // console.log(address);
    // setupContract.getPubKey(address).then(e => console.log(e)).catch(e => console.log('error', e.reason));
    // console.log(str); // "0x657468657265756d"
    // const contractWithSigner = setupContract.connect(_wallet);
    // const tx = await contractWithSigner.setMetadata(address, [metadataBytes]);
    // const tx = await contractWithSigner.getPubkey(address);

    // console.log('hash', publicKeyBytes);
    // await tx.wait();
    // console.log(address, [metadataBytes]);
    // const txn =  await setupContract.populateTransaction.setPubKey(address, [publicKeyBytes]);
    // let txnHash;
    // try {
    //   txnHash = _wallet.sendTransaction(txn).then((r) => {console.log(r)}).catch(err=> {console.log(err)});
    // } catch(err) {
    //   console.log(err.reason);
    // }
  } else {
    returnData.success = false;
    returnData.error = 'Can not get account info from storage.';
    return returnData;
  }
};
