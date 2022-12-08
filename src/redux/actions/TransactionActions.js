// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

// Import the ethers library
import {ethers} from 'ethers';

import erc20ABI from '../../abis/erc20ABI.json';
import transactionABI from '../../abis/transaction.json';
import Toast from 'react-native-toast-message';
import {Alert} from 'react-native';
import constants from '../../constants';
import {getCodeVerifierAndChallenge} from '../../utils/pkce';
import {ConvertToUrlForm, generateAccessToken} from '../../utils/form';

export const sendTransaction = (
  dispatch,
  data,
  beforeWork,
  successCallback,
  failCallback,
) => {
  beforeWork();
  const {
    currentNetworkRPC,
    fromPrivateKey,
    toAddress,
    value,
    token,
    feeInfo,
    public_key_encoded,
    imei,
    iccid,
  } = data;
  const provider = new ethers.providers.JsonRpcProvider(currentNetworkRPC);
  const wallet = new ethers.Wallet(fromPrivateKey, provider);
  if (token === 'main') {
    // const rawTx = {
    //   to: toAddress,
    //   value: ethers.utils.parseEther(value.toString()),
    //   ...feeInfo,
    // };
    // wallet
    //   .populateTransaction(rawTx)
    //   .then(tx => {
    //     console.log('Transaction Action send Main: ', tx);
    //     successCallback(tx);
    //     wallet
    //       .sendTransaction(tx)
    //       .then(resTxn => {
    //         console.log('transaction action:::::', resTxn);
    //         resTxn
    //           .wait()
    //           .then(receipt => {
    //             Toast.show({
    //               type: 'txnCompleted',
    //               position: 'bottom',
    //               bottomOffset: 120,
    //               props: {
    //                 transaction: {...resTxn},
    //               },
    //             });
    //           })
    //           .catch(err => {
    //             console.log(err, err.reason);
    //             if (err.reason != 'cancelled') {
    //               Toast.show({
    //                 type: 'error',
    //                 position: 'bottom',
    //                 bottomOffset: 120,
    //                 text1: 'Error occured',
    //                 props: {
    //                   error: err,
    //                 },
    //               });
    //             }
    //           });
    //       })
    //       .catch(err => {
    //         console.log('Transaction Action Error:::::: ', err);
    //         failCallback();
    //       });
    //   })
    //   .catch(err => {
    //     console.log('Transaction Action Error:::::: ', err);
    //     failCallback();
    //   });

    const transactionContract = new ethers.Contract(
      constants.transactionContractAddress,
      transactionABI,
      provider,
    );
    transactionContract.populateTransaction
      .sendFrom(toAddress)
      .then(rawTx => {
        wallet
          .populateTransaction(rawTx)
          .then(refinedTxn => {
            // console.log({refinedTxn, feeInfo});
            // successCallback({...refinedTxn, ...feeInfo});
            wallet
              .sendTransaction({...rawTx})
              .then(resTxn => {
                // console.log(
                //   'Token send Transaction actions;;;;;;; Res txn:::: ',
                //   resTxn,
                // );
                resTxn
                  .wait()
                  .then(receipt => {
                    const numTransaction = Number(receipt.logs[0].data);
                    console.log(numTransaction);
                    const tx_hash = receipt.logs[0].transactionHash;
                    const {pkce_verifier, pkce_challenge} =
                      getCodeVerifierAndChallenge();
                    fetch(
                      constants.devHost +
                        'relayer/' +
                        tx_hash +
                        '&' +
                        pkce_challenge,
                      {
                        method: 'POST',
                        headers: {
                          Accept: 'application/json',
                          'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: ConvertToUrlForm({
                          payload: generateAccessToken(public_key_encoded, {
                            numTransaction,
                          }),
                        }),
                      },
                    )
                      .then(response => response.json())
                      .then(resJson => {
                        console.log({resJson});
                        if (resJson.status) {
                          fetch(constants.devHost + 'sign/' + pkce_verifier, {
                            method: 'POST',
                            headers: {
                              Accept: 'application/json',
                              'Content-Type':
                                'application/x-www-form-urlencoded',
                            },
                            body: ConvertToUrlForm({
                              payload: generateAccessToken(public_key_encoded, {
                                imei,
                                iccid,
                              }),
                            }),
                          })
                            .then(response2 => response2.json())
                            .then(resJson2 => {
                              console.log({resJson2});
                              if (resJson2.status) {
                                console.log('a');
                                transactionContract.populateTransaction
                                  .transferFromCustom(
                                    wallet.address,
                                    toAddress,
                                    ethers.utils.parseEther(value.toString()),
                                    numTransaction,
                                  )
                                  .then(rawTx2 => {
                                    console.log('aa');
                                    wallet
                                      .populateTransaction(rawTx2)
                                      .then(d => {
                                        successCallback(d);
                                        console.log('h');
                                        wallet
                                          .sendTransaction({
                                            ...rawTx2,
                                            value: ethers.utils.parseEther(
                                              value.toString(),
                                            ),
                                          })
                                          .then(resTxn2 => {
                                            console.log('h1');
                                            resTxn2
                                              .wait()
                                              .then(receipt2 => {
                                                console.log('h2');
                                                console.log({receipt2});
                                                Toast.show({
                                                  type: 'txnCompleted',
                                                  position: 'bottom',
                                                  bottomOffset: 120,
                                                  props: {
                                                    transaction: {...resTxn2},
                                                  },
                                                });
                                              })
                                              .catch(err => {
                                                failCallback();
                                                console.log(
                                                  'Transaction Action Error 0 ',
                                                  err,
                                                );
                                                console.log('h3');
                                              });
                                          })
                                          .catch(err => {
                                            failCallback();
                                            console.log('h4');
                                            console.log(
                                              'Transaction Action Error 1 ',
                                              err,
                                            );
                                          });
                                      })
                                      .catch(err => {
                                        console.log('h5');
                                        failCallback();
                                        console.log(
                                          'Transaction Action Error 2 ',
                                          err,
                                        );
                                      });
                                  })
                                  .catch(err => {
                                    console.log('h6');
                                    failCallback();
                                    console.log(
                                      'Transaction Action Error 3',
                                      err,
                                    );
                                  });
                              } else {
                                failCallback();
                                console.log('h7');
                                Toast.show({
                                  type: 'error',
                                  position: 'bottom',
                                  bottomOffset: 120,
                                  text1: 'Failed to get relayer sign',
                                });
                              }
                            })
                            .catch(err => {
                              failCallback();
                              console.log('Transaction Action Error 4', err);
                            });
                        } else {
                          failCallback();
                        }
                      })
                      .catch(err => {
                        console.log('Transaction Action Error 5', err);
                        failCallback();
                      });
                  })
                  .catch(err => {
                    console.log(err, err.reason);
                    if (err.reason != 'cancelled') {
                      Toast.show({
                        type: 'error',
                        position: 'bottom',
                        bottomOffset: 120,
                        text1: 'Error occured',
                        props: {
                          error: err,
                        },
                      });
                    }
                  });
              })
              .catch(err => {
                console.log('Transaction Action Error: ', err);
                failCallback();
              });
          })
          .catch(err => {
            console.log('Transaction Action Error:: ', err);
            failCallback();
          });
      })
      .catch(err => {
        console.log('Transaction Action Error::: ', err);
        failCallback();
      });
  } else {
    Alert.alert('Error in calling not main token.');
    return;
    const tokenContract = new ethers.Contract(
      token.tokenAddress,
      erc20ABI,
      provider,
    );
    tokenContract.populateTransaction
      .transfer(toAddress, ethers.utils.parseEther(value.toString()))
      .then(rawTx => {
        console.log('Transaction actions raw tx: ', rawTx);
        wallet
          .populateTransaction(rawTx)
          .then(refinedTxn => {
            successCallback({...refinedTxn, ...feeInfo});
            wallet
              .sendTransaction({...rawTx, ...feeInfo})
              .then(resTxn => {
                console.log(
                  'Token send Transaction actions;;;;;;; Res txn:::: ',
                  resTxn,
                );
                resTxn
                  .wait()
                  .then(receipt => {
                    Toast.show({
                      type: 'txnCompleted',
                      position: 'bottom',
                      bottomOffset: 120,
                      props: {
                        transaction: {...resTxn},
                      },
                    });
                  })
                  .catch(err => {
                    console.log(err, err.reason);
                    if (err.reason != 'cancelled') {
                      Toast.show({
                        type: 'error',
                        position: 'bottom',
                        bottomOffset: 120,
                        text1: 'Error occured',
                        props: {
                          error: err,
                        },
                      });
                    }
                  });
              })
              .catch(err => {
                console.log('Transaction Action Error:::::: ', err);
                failCallback();
              });
          })
          .catch(err => {
            console.log('Transaction Action Error:::::: ', err);
            failCallback();
          });
      })
      .catch(err => {
        console.log('Transaction Action Error:::::: ', err);
        failCallback();
      });
  }
};
