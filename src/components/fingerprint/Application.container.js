import React, {Component} from 'react';
import {Image, Text, TouchableOpacity, View, AppState} from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';

import styles from './Application.container.styles';
import FingerprintPopup from './FingerprintPopup.component';

let subscription;
class Application extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: undefined,
      biometric: undefined,
      popupShowed: false,
    };
  }

  handleFingerprintShowed = () => {
    this.setState({popupShowed: true});
  };

  handleFingerprintDismissed = () => {
    this.setState({popupShowed: false});
  };

  success = status => {
    this.props.success(status);
  };

  componentDidMount() {
    subscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );
    // Get initial fingerprint enrolled
    this.detectFingerprintAvailable();
  }

  componentWillUnmount() {
    subscription.remove();
    // AppState.removeEventListener('change', this.handleAppStateChange);
  }

  detectFingerprintAvailable = () => {
    FingerprintScanner.isSensorAvailable().catch(error => {
      this.setState({errorMessage: error.message, biometric: error.biometric});
      setTimeout(() => {
        this.props.success(false);
      }, 1000)
    });
  };

  handleAppStateChange = nextAppState => {
    if (
      this.state.appState &&
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      FingerprintScanner.release();
      this.detectFingerprintAvailable();
    }
    this.setState({appState: nextAppState});
  };

  render() {
    const {errorMessage, biometric, popupShowed} = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Please touch below</Text>

        <TouchableOpacity
          style={styles.fingerprint}
          onPress={this.handleFingerprintShowed}
          disabled={!!errorMessage}>
          <Image source={require('../../assets/images/finger_print.png')} />
        </TouchableOpacity>

        {errorMessage && (
          <Text style={styles.errorMessage}>
            {errorMessage} {biometric}
          </Text>
        )}

        {popupShowed && (
          <FingerprintPopup
            style={styles.popup}
            handlePopupDismissed={this.handleFingerprintDismissed}
            success={this.success}
          />
        )}
      </View>
    );
  }
}

export default Application;
