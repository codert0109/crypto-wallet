import {generateMetadata} from '../../utils/metadata';
import {getCodeVerifierAndChallenge} from '../../utils/pkce';
import {ConvertToUrlForm, generateAccessToken} from '../../utils/form';
import Constants from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCurrentPublicKeyFromStorage} from '../../utils/account';

export const setMetadata = async (
  dispatch,
  beforeWork,
  successCallback,
  failCallback,
  progressCallback,
  isSaved,
) => {
  beforeWork();
  let returned;
  let metadata = await AsyncStorage.getItem('metadata');
  if (metadata) {
    metadata = JSON.parse(metadata);
  }
  if (isSaved) {
    const currentAccountPublicKeyEncoded =
      await getCurrentPublicKeyFromStorage();
    const currentMetadataIndex = metadata.findIndex(
      r => r.public_key == currentAccountPublicKeyEncoded,
    );
    returned = {
      error: null,
      hash: metadata[currentMetadataIndex].hash,
      metadata: metadata[currentMetadataIndex],
      success: true,
    };
  } else {
    returned = await generateMetadata();
    let newData;
    if (metadata) {
      newData = [
        ...metadata,
        {
          ...returned.metadata,
          hash: returned.hash,
          isSaved: false,
        },
      ];
    } else {
      newData = [
        {
          ...returned.metadata,
          hash: returned.hash,
          isSaved: false,
        },
      ];
    }
    const success = await AsyncStorage.setItem(
      'metadata',
      JSON.stringify(newData),
    );
  }
  // const returned = {
  //   error: null,
  //   hash: '0xb650709cc9777f91fe934f59a0fc827f1ab708c3c12c3bfd07927ddeb6422334',
  //   metadata: {
  //     eth_address: '0x90b02778545671c116232142f43aa896f9ebbfd1',
  //     hash_type: 'RS256',
  //     iccid: '+12276634972',
  //     imei: '9a7d7a7bdd8458ab',
  //     public_key:
  //       'eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzM0LDI0MSw3NSwxMTksMjM5LDk1LDMsMTkxLDI0OCwyMjYsMTUwLDE5MiwxNjEsMjU0LDgyLDIzMywxOTYsMjEsMTczLDcsNTEsMjMwLDQsMjUwLDUyLDYzLDc2LDE3NywxNzUsMjE4LDI0NiwxMTcsMTYsMjIwLDEyNiwxMTMsODksMTQxLDM0LDU4LDEzMCwxMzIsMjA3LDcyLDU0LDIxOCw4MSwyMDMsMjQ2LDE4NSw0MSwxNDQsNjEsMjEzLDEwOCwxMzMsMTMyLDc0LDEzOCwyMTIsMTU2LDEwOSwyMDMsMTg5XX0=',
  //   },
  //   success: true,
  // };
  if (returned.success) {
    const {pkce_verifier, pkce_challenge} = getCodeVerifierAndChallenge();
    let response;
    progressCallback(1);
    try {
      response = await fetch(
        Constants.devHost + 'challenge/' + returned.hash + '&' + pkce_challenge,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: ConvertToUrlForm(returned.metadata),
        },
      );
    } catch (e) {
      console.log('error in first call', e);
      return failCallback('Error in call server!');
    }
    const responseJson = await response.json();
    const responseStatus = response.status;
    if (responseJson.status) {
      progressCallback(2);
      try {
        const response2 = await fetch(
          Constants.devHost + 'verifier/' + pkce_verifier,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: ConvertToUrlForm({
              payload: generateAccessToken(
                returned.metadata.public_key,
                returned.metadata,
              ),
            }),
          },
        );
        const response2Json = await response2.json();
        if (response2Json.status) {
          progressCallback(3);
          let newData;
          if (metadata) {
            newData = [
              ...metadata,
              {
                ...returned.metadata,
                hash: returned.hash,
                isSaved: false,
              },
            ];
          } else {
            newData = [
              {
                ...returned.metadata,
                hash: returned.hash,
                isSaved: false,
              },
            ];
          }
          const success = await AsyncStorage.setItem(
            'metadata',
            JSON.stringify(newData),
          );
          setTimeout(() => {
            successCallback();
          }, 2000);
        } else {
          failCallback(response2Json.data);
        }
      } catch (e) {
        console.log('error in second call', e);
        return failCallback('Error to save data to db.');
      }
    } else {
      return failCallback(responseJson.data);
      if (responseStatus == 204) {
        // same part
        let responseAgain;
        try {
          responseAgain = await fetch(
            Constants.devHost +
              'challenge/' +
              returned.hash +
              '&' +
              pkce_challenge,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: ConvertToUrlForm(returned.metadata),
            },
          );
        } catch (e) {
          console.log('error in first call', e);
          return failCallback('Error in call server!');
        }
        const responseAgainJson = await responseAgain.json();
        if (responseAgainJson.status) {
          progressCallback(2);
          try {
            const responseAgain2 = await fetch(
              Constants.devHost + 'verifier/' + pkce_verifier,
              {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: ConvertToUrlForm({
                  payload: generateAccessToken(
                    returned.metadata.public_key,
                    returned.metadata,
                  ),
                }),
              },
            );
            const responseAgain2Json = await responseAgain2.json();
            if (responseAgain2Json.status) {
              progressCallback(3);
              setTimeout(() => {
                successCallback();
              }, 2000);
            } else {
              failCallback(responseAgain2Json.data);
            }
          } catch (e) {
            console.log('error in second call', e);
            return failCallback('Error to save data to db.');
          }
        } else {
          failCallback(responseAgainJson.data);
        }
        // -- same part --
      }
    }
  } else {
    failCallback(returned.error);
  }
};
