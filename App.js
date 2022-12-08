import {Provider} from 'react-redux';
import React, {useEffect} from 'react';
import {
  Platform,
  StyleSheet,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Text,
  Alert,
  Button,
} from 'react-native';
import {PersistGate} from 'redux-persist/integration/react';
import {NavigationContainer} from '@react-navigation/native';
import {colors} from './src/styles';
import {store, persistor} from './src/redux/store';
import AppView from './src/AppViewContainer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import './shim.js';
import {LogBox} from 'react-native';

LogBox.ignoreLogs(['Reanimated 2', 'React.createFactory']);

export default function App() {

  useEffect(() => {
  }, []);

  return (
    <SafeAreaProvider>
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
