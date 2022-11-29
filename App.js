import {Provider} from 'react-redux';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View, ActivityIndicator, PermissionsAndroid, Text, Alert, Button } from 'react-native';
import {PersistGate} from 'redux-persist/integration/react';
import {NavigationContainer} from '@react-navigation/native';
import {colors} from './src/styles';
import {store, persistor} from './src/redux/store';
// import {MenuProvider} from 'react-native-popup-menu';
import AppView from './src/AppViewContainer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import './shim.js';
import {LogBox} from 'react-native';
LogBox.ignoreLogs(['Reanimated 2', 'React.createFactory']);

export default function App() {
  async function request_READ_PHONE_STATE() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE ,
        {
          'title': 'ReactNativeCode wants to READ_PHONE_STATE',
          'message': 'ReactNativeCode App needs access to your personal data. '
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Alert.alert("Permission Granted.");
      }
      else {
        Alert.alert("Permission Not Granted");
      }
    } catch (err) {
      console.warn(err)
    }
  }

  useEffect(() => {
    async function grant_action() {
      await request_READ_PHONE_STATE();
    }
    grant_action();
  }, [])
  return (
    <SafeAreaProvider>
      {/* <MenuProvider> */}
        <Provider store={store}>
          <NavigationContainer>
            <PersistGate
              loading={
                <View style={styles.container}>
                  <ActivityIndicator color={colors.red} />
                </View>
              }
              persistor={persistor}>
              <AppView />
            </PersistGate>
          </NavigationContainer>
        </Provider>
      {/* </MenuProvider> */}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
