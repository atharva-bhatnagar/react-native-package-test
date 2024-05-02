/**
 * @format
 */
import 'react-native-polyfill-globals/auto';
import 'react-native-fetch-api';
import 'fast-text-encoding';
import {AppRegistry, useColorScheme} from 'react-native';
import {name as appName} from './app.json';
import React, { createContext, useContext, useState } from 'react';
import PolyfillCrypto from 'react-native-webview-crypto';
import {
  DelegationIdentity,
  Ed25519PublicKey,
  ECDSAKeyIdentity,
  DelegationChain,
  Ed25519KeyIdentity,
} from '@dfinity/identity';
import {Actor, HttpAgent, toHex, fromHex} from '@dfinity/agent';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import {StyleSheet, TouchableOpacity, Linking} from 'react-native';
import {createActor,backend} from './src/declarations/backend';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import App from './src/App';
import { handleLogin, handleLogout } from './src/utils';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['rentspace://'],
};
export const UserContext=createContext(null)

const RootComponent: React.FC = () => {

  
  const [user,setUser]=useState("Not logged in yet!")

  let generatedKeyPair;

  return (
    <UserContext.Provider value={{user,setUser}}>
      <PolyfillCrypto />
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName='Launch'>
          <Stack.Screen options={{headerShown:false}} name='Launch' component={App} initialParams={{handleLogin,handleLogout}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  );
};

AppRegistry.registerComponent(appName, () => RootComponent);

const styles = StyleSheet.create({
  loginBtn: {
    display: 'flex',
    flexDirection: 'row',
    minWidth: 300,
    maxWidth: '80%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    //borderColor: COLORS.inputBorder, 
    borderRadius: 10,
    marginBottom: 10,

  },
  loginBtnText: {
    fontSize: 12,
    width: '40%',
    color: "black",
    fontWeight: 'bold',
    textAlign: 'left',
  },
});
