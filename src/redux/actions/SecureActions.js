import bcrypt from 'bcrypt-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from '../../constants';

// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

export const createSecure = (
  data,
  beforeWork,
  successCallback,
  failCallback,
) => {
  beforeWork();

  bcrypt
    .getSalt(Constants.saltRound)
    .then(salt => {
      const {password, isFingerPrintUsed, pinCode} = data;
      bcrypt
        .hash(salt, password)
        .then(hash => {
          AsyncStorage.multiSet([
            ['password', hash],
            ['isFingerPrintUsed', JSON.stringify(isFingerPrintUsed)],
            ['pinCode', JSON.stringify(pinCode)],
          ])
            .then(() => {
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
