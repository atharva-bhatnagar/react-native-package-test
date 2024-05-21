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
import {StyleSheet, TouchableOpacity, Linking} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import App from './src/App';
import { handleLogin,handleLogout,autoLogin } from 'react-native-icp-auth'

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['example://'],
};
export const UserContext=createContext(null)

const RootComponent: React.FC = () => {

  
  const [user,setUser]=useState("Not logged in yet!")
  const [isAuthenticated,setIsAuthenticated]=useState(false)

  let generatedKeyPair;

  return (
    <UserContext.Provider value={{user,setUser,isAuthenticated,setIsAuthenticated}}>
      <PolyfillCrypto />
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName='Launch'>
          <Stack.Screen options={{headerShown:false}} name='Launch' component={App} initialParams={{handleLogin,handleLogout,autoLogin}}/>
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
