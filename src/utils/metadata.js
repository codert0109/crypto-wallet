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
import constants from '../constants';
import {getCurrentPublicKeyFromStorage} from './account';
import {Alert} from 'react-native';

export const writeMetadata = async () => {
  const returnData = {
    success: false,
    error: null,
    hash: null,
    metadata: null,
  };
  const accounts_info_json = await AsyncStorage.getItem('accounts_info');
  if (accounts_info_json) {
    const accounts_info = JSON.parse(accounts_info_json);
    let currentAccountIndex = store.getState().accounts.currentAccountIndex;
    if (typeof currentAccountIndex == undefined) {
      currentAccountIndex = 0;
    }
    const account = accounts_info.accounts[currentAccountIndex];
    const privateKey = account.privateKey;
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const wallet = Wallet.fromPrivateKey(privateKeyBuffer);
    const publicKey = wallet.getPublicKey();
    const address = '0x' + wallet.getAddress().toString('hex');
    const currentNetwork = store.getState().networks.currentNetwork;
    const network = store.getState().networks.networks[currentNetwork];
    const publicKeyEncoded = btoa(JSON.stringify(publicKey));
    const metadata = await generateMetadata();
    const metadataEncoded = btoa(JSON.stringify(metadata));
    // Encrypt
    // const publickeyEncrypted = CryptoJS.AES.encrypt(
    //   publicKeyEncoded,
    //   privateKey,
    // ).toString();
    const metadataEncrypted = CryptoJS.AES.encrypt(
      metadataEncoded,
      publicKeyEncoded,
    ).toString();

    const provider = new ethers.providers.JsonRpcProvider(network.rpc);
    const _wallet = new ethers.Wallet(privateKey, provider);
    const signer = _wallet.provider.getSigner(_wallet.address);
    const setupContract = new ethers.Contract(
      Constants.setupContractAddress,
      setupABI,
      signer,
    );
    const publicKeyBytes = util.fromAscii(publicKeyEncoded);
    const metadataBytes = util.fromAscii(metadataEncrypted);
    console.log('write', metadataBytes, metadata);
    try {
      const nTx = await setupContract.populateTransaction.setMetadata(address, [
        metadataBytes,
      ]);
      const nTx2 = await setupContract.populateTransaction.setPubKey(address, [
        publicKeyBytes,
      ]);
      const txn = await _wallet.sendTransaction(nTx);
      const txn2 = await _wallet.sendTransaction(nTx2);
      if (txn.hash && txn2.hash) {
        returnData.success = true;
        returnData.hash = txn2.hash;
        returnData.metadata = metadata;
        return returnData;
      } else {
        returnData.success = false;
        returnData.error = 'Can not set data to blockchain.';
        return returnData;
      }
    } catch (e) {
      console.log('error in writing to blockchain', e);
      returnData.success = false;
      // returnData.error = e;
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

export const getMetadataFromChain = async () => {
  const accounts_info_json = await AsyncStorage.getItem('accounts_info');
  if (accounts_info_json) {
    const accounts_info = JSON.parse(accounts_info_json);
    let currentAccountIndex = store.getState().accounts.currentAccountIndex;
    if (typeof currentAccountIndex == undefined) {
      currentAccountIndex = 0;
    }
    const account = accounts_info.accounts[currentAccountIndex];
    const privateKey = account.privateKey;
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const wallet = Wallet.fromPrivateKey(privateKeyBuffer);
    const address = '0x' + wallet.getAddress().toString('hex');
    const currentNetwork = store.getState().networks.currentNetwork;
    const network = store.getState().networks.networks[currentNetwork];
    const provider = new ethers.providers.JsonRpcProvider(network.rpc);
    const _wallet = new ethers.Wallet(privateKey, provider);
    const signer = _wallet.provider.getSigner(_wallet.address);
    const setupContract = new ethers.Contract(
      Constants.setupContractAddress,
      setupABI,
      signer,
    );
    try {
      //get metadata
      const metadataBytesFromContract = await setupContract.getMetadata(
        address,
      );
      if (metadataBytesFromContract) {
        return metadataBytesFromContract;
      } else {
        return false;
      }
      // get metadata end
    } catch (e) {
      console.log('error in reading to blockchain', e);
      return false;
    }
  } else {
    return false;
  }
};

export const verifyMasterAddressFromChain = async master_address => {
  const accounts_info_json = await AsyncStorage.getItem('accounts_info');
  if (accounts_info_json) {
    const accounts_info = JSON.parse(accounts_info_json);
    let currentAccountIndex = store.getState().accounts.currentAccountIndex;
    if (typeof currentAccountIndex == undefined) {
      currentAccountIndex = 0;
    }
    const account = accounts_info.accounts[currentAccountIndex];
    const privateKey = account.privateKey;
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const wallet = Wallet.fromPrivateKey(privateKeyBuffer);
    const address = '0x' + wallet.getAddress().toString('hex');
    const currentNetwork = store.getState().networks.currentNetwork;
    const network = store.getState().networks.networks[currentNetwork];
    const provider = new ethers.providers.JsonRpcProvider(network.rpc);
    const _wallet = new ethers.Wallet(privateKey, provider);
    const signer = _wallet.provider.getSigner(_wallet.address);
    const setupContract = new ethers.Contract(
      Constants.setupContractAddress,
      setupABI,
      signer,
    );
    try {
      //verifyAddress
      const isMasterAddress = await setupContract.isMasterAddress(
        address,
        address,
      );
      return isMasterAddress;
      // get verifyAddress
    } catch (e) {
      console.log('error in reading to blockchain', e);
      return false;
    }
  } else {
    return false;
  }
};

export const setMasterAddressToChain = async (
  _toAddress,
  _master_address,
  successCallback,
  failCallback,
) => {
  const accounts_info_json = await AsyncStorage.getItem('accounts_info');
  if (accounts_info_json) {
    const accounts_info = JSON.parse(accounts_info_json);
    let account, master_address;
    if (_toAddress) {
      account = accounts_info.accounts.find(r => r.address == _toAddress);
      master_address = _master_address;
    } else {
      let currentAccountIndex = store.getState().accounts.currentAccountIndex;
      if (typeof currentAccountIndex == undefined) {
        currentAccountIndex = 0;
      }
      account = accounts_info.accounts[currentAccountIndex];
      master_address = account.address;
    }
    const privateKey = account.privateKey;
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const wallet = Wallet.fromPrivateKey(privateKeyBuffer);
    const address = '0x' + wallet.getAddress().toString('hex');
    const currentNetwork = store.getState().networks.currentNetwork;
    const network = store.getState().networks.networks[currentNetwork];
    const provider = new ethers.providers.JsonRpcProvider(network.rpc);
    const _wallet = new ethers.Wallet(privateKey, provider);
    const signer = _wallet.provider.getSigner(_wallet.address);
    const setupContract = new ethers.Contract(
      Constants.setupContractAddress,
      setupABI,
      signer,
    );
    try {
      const nTx = await setupContract.populateTransaction.setMasters(
        master_address,
      );
      const txn = await _wallet.sendTransaction(nTx);
      // const resTxn = await txn.wait();
      if (txn.hash) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log('error in writing to blockchain', e);
      return false;
    }
  } else {
    return false;
  }
};

export const generateMetadata = async () => {
  const accounts_info_json = await AsyncStorage.getItem('accounts_info');
  if (accounts_info_json) {
    const accounts_info = JSON.parse(accounts_info_json);
    let currentAccountIndex = store.getState().accounts.currentAccountIndex;
    if (typeof currentAccountIndex == undefined) {
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
    const publicKeyEncoded = btoa(JSON.stringify(publicKey));
    const metadata = {
      hash_type: algorithm_type,
      eth_address: address,
      public_key: publicKeyEncoded,
      imei: uId,
      iccid: phone_number,
    };
    return metadata;
  } else {
    return false;
  }
};

export const getMetadataFromStorage = async currentAccountPublicKeyEncoded => {
  const metadatasFromStorage_json = await AsyncStorage.getItem('metadata');
  let metadatasFromStorage, metadataFromStorage;
  console.log('q');
  if (metadatasFromStorage_json) {
    console.log('w');
    metadatasFromStorage = JSON.parse(metadatasFromStorage_json);
    if (metadatasFromStorage && metadatasFromStorage[0]) {
      console.log('e', metadatasFromStorage);
      metadataFromStorage = metadatasFromStorage.find(
        r => r.public_key == currentAccountPublicKeyEncoded,
      );
      return metadataFromStorage;
    }
  }
  console.log('r');
  return false;
};

export const updateMetadataStorage = async metadata => {
  const publicKeyEncoded = await getCurrentPublicKeyFromStorage();
  const metadatasFromStorage_json = await AsyncStorage.getItem('metadata');
  let metadatasFromStorage;
  console.log('q');
  if (metadatasFromStorage_json) {
    console.log('w');
    metadatasFromStorage = JSON.parse(metadatasFromStorage_json);
    if (metadatasFromStorage && metadatasFromStorage[0]) {
      console.log('e', metadatasFromStorage);
      let newData = metadatasFromStorage.map(r => {
        if (r.public_key == publicKeyEncoded) {
          return {
            ...metadata,
          };
        } else {
          return r;
        }
      });
      const success = AsyncStorage.setItem('metadata', JSON.stringify(newData));
      if (success) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    const success = AsyncStorage.setItem(
      'metadata',
      JSON.stringify([metadata]),
    );
  }
  console.log('r');
  return false;
};

const compareMetadata = (metadataFromStorage, metadata) => {
  if (
    metadataFromStorage.hash_type == metadata.hash_type &&
    metadataFromStorage.eth_address == metadata.eth_address &&
    metadataFromStorage.public_key == metadata.public_key &&
    metadataFromStorage.imei == metadata.imei &&
    metadataFromStorage.iccid == metadata.iccid
  ) {
    return true;
  }
  return false;
};

const syncMetadata = () => {
  AsyncStorage.getItem('metadata').then(e => {
    if (e) {
      let newData;
      let metadata = JSON.parse(e);
      if (metadata && metadata[0]) {
        newData = [];
      }
    }
  });
};

export const getMetadataStatus = async () => {
  const publicKeyEncoded = await getCurrentPublicKeyFromStorage();
  const metadataFromStorage = await getMetadataFromStorage(publicKeyEncoded);
  if (!metadataFromStorage) {
    return constants.metadata_status.NOTLOCALSET;
  }
  const metadata = await generateMetadata();
  let isSame = compareMetadata(metadataFromStorage, metadata);
  if (!isSame) {
    // Alert.alert(
    //   'Assertion failed. Storage meta data and current data is not same.',
    //   '',
    //   [
    //     {
    //       text: 'Sync Now',
    //       onPress: () => {
    //         syncMetadata();
    //       },
    //       style: 'cancel',
    //     },
    //   ],
    //   {
    //     cancelable: true,
    //     onDismiss: () => {
    //       // Alert.alert(
    //       //   "This alert was dismissed by tapping outside of the alert dialog."
    //       // ),
    //     },
    //   },
    // );
    return constants.metadata_status.DIFFERENTSTORAGECURRENT;
  }
  console.log({publicKeyEncoded});
  const metadataEncoded = btoa(JSON.stringify(metadata));
  const metadataEncrypted = CryptoJS.AES.encrypt(
    metadataEncoded,
    publicKeyEncoded,
  ).toString();
  const metadataBytes = util.fromAscii(metadataEncrypted);
  const metadataBytesFromContract = await getMetadataFromChain();
  console.log(metadata, metadataBytes);
  if (metadataBytesFromContract && metadataBytesFromContract[0]) {
    if (metadataBytesFromContract[0] == metadataBytes) {
      return constants.metadata_status.SAME;
    } else {
      return constants.metadata_status.DIFFERENTCHAINLOCAL;
    }
  } else {
    return constants.metadata_status.NOTCAHINSET;
  }
};

// // Decrypt
// var bytes = CryptoJS.AES.decrypt(metadata, privateKey);
// var originalText = bytes.toString(CryptoJS.enc.Utf8);
