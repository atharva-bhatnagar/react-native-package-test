import {
  DelegationIdentity,
  ECDSAKeyIdentity,
  DelegationChain,
} from '@dfinity/identity';
import {Actor, HttpAgent, toHex, fromHex, blsVerify} from '@dfinity/agent';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import { Linking, NativeModules } from 'react-native';
import { errors } from './types/errors';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'; 
import { idlFactory } from './declarations/backend';

global.Buffer = require('buffer').Buffer;

let generatedKeyPair
const BACKEND_CANISTER_ID_MAINNET="nkjmk-rqaaa-aaaao-a3mvq-cai"


export async function handleLogin(environment,canisters,appName){
return new Promise(async(resolve,reject)=>{
  let baseURL=environment.isTesting?`http://127.0.0.1:4943/?canisterId=${environment.middlepageID}&`:"https://nnik6-4iaaa-aaaao-a3mva-cai.icp0.io?"
  await ECDSAKeyIdentity.generate({extractable: true}).then(async(keyp)=>{

  generatedKeyPair=keyp
  console.log('running handle login', keyp);
  try {
    const url = `${baseURL}publicKey=${toHex(
      keyp.getPublicKey().toDer(),
    )}&appName=${appName}`;
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: '#453AA4',
        preferredControlTintColor: 'white',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android Properties
        showTitle: true,
        toolbarColor: '#6200EE',
        secondaryToolbarColor: 'black',
        navigationBarColor: 'black',
        navigationBarDividerColor: 'white',
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
        headers: {
          'my-custom-header': 'my custom header value',
        },
      });
      Linking.addEventListener('url', async(event)=>{
        try{
          let newRes=await handleDeepLink(event,canisters,environment)
          resolve(newRes)
        }catch(err){
          reject(err)
        }
        
        
      });
      await this.sleep(800);
    } else Linking.openURL(url);
  } catch (error) {
    console.log(error);
    // reject(errors.deeplinkErr)
  }
}).catch((err)=>{
  reject(errors.keygenerationErr)
})
})
  
};

async function handleDeepLink(event,canisters,environment){
  try{
      const deepLink = event.url;
      const urlObject = new URL(deepLink);
      const delegation = urlObject.searchParams.get('delegation');
      console.log("del",delegation)
      const chain = DelegationChain.fromJSON(
      JSON.parse(decodeURIComponent(delegation)),
      );
      console.log("chain",chain)
      console.log('\ngeneratedKeyPair',generatedKeyPair)
      const middleIdentity = DelegationIdentity.fromDelegation(
      generatedKeyPair,
      chain,
      );
      console.log("midid",middleIdentity)
      
      const agent = new HttpAgent({
      identity: middleIdentity,
      fetchOptions: {
          reactNative: {
          __nativeResponseType: 'base64',
          },
      },
      callOptions: {
          reactNative: {
          textStreaming: true,
          },
      },
      blsVerify: () => true,
      host: environment.isTesting?'http://127.0.0.1:4943':'https://icp-api.io',
      });
      let pubKey = toHex(
        await crypto.subtle.exportKey(
          'raw',
          middleIdentity._inner._keyPair.publicKey,
        ),
      );
      let priKey = toHex(
        await crypto.subtle.exportKey(
          'pkcs8',
          middleIdentity._inner._keyPair.privateKey,
        ),
      );
      console.log("agent",agent)
      let actor
      
      if(environment.isTesting){
        actor = Actor.createActor(environment.backendIDL,{
          agent,
          blsVerify:()=>true,
          canisterId:environment.backendID
        });
      }else{
        actor = Actor.createActor(idlFactory,{
          agent,
          blsVerify:()=>true,
          canisterId:BACKEND_CANISTER_ID_MAINNET
        });
      }
      let actorArr=[]
      for(let i=0;i<canisters.length;i++){
        let new_actor = Actor.createActor(canisters[i].idlFactory,{
          agent,
          blsVerify:()=>true,
          canisterId:canisters[i].id
        });
        actorArr.push(new_actor)
      }

      let principle=await actor.whoami()
      storeInAsyncStorage("pubkey",pubKey)
      storeInAsyncStorage("prikey",priKey)
      storeInAsyncStorage("delegation",delegation)
      return {
        principle:principle,
        actors:[...actorArr]
      }

      // return("successful")
  }catch(err){
      console.log(err)
      return err
  }
  
};

async function storeInAsyncStorage(key,item){
  await AsyncStorage.setItem(key,item).catch((err)=>{
    console.log(`Asyncstorage err set ietm : ${err}`)
  }).then((res)=>{
    console.log(`Response for setitem Async store : ${res}`)
  })
}
async function getFromAsyncStore(key){
  let data;
  await AsyncStorage.getItem(key).then((res)=>{
    data=res
    console.log(`Async store get item res : ${res}`)
  }).catch((err)=>{
    console.log(`Async store get item err : ${err}`)
  })
  return data
}

export async function autoLogin(environment,canisters){
  let pubKey=await getFromAsyncStore("pubkey")
    let priKey=await getFromAsyncStore("prikey")
    let delegation=await getFromAsyncStore("delegation")
  try{

    let publicKey = await crypto.subtle.importKey(
      "raw",
      Buffer.from(fromHex(pubKey)),
      { name: "ECDSA", namedCurve: "P-256" }, 
      true,
      ["verify"] 
  )
    let privateKey = await crypto.subtle.importKey("pkcs8",
    Buffer.from(fromHex(priKey)),
    { name: "ECDSA", namedCurve: "P-256" }, 
    true, 
    ["sign"] )
    console.log("generateKey._keyPair.privateKey",privateKey)
    let newKeyPair = await ECDSAKeyIdentity.fromKeyPair({privateKey,publicKey})
    console.log("newKeyPair",toHex(newKeyPair.getPublicKey().toDer()));

    const Delchain = DelegationChain.fromJSON(
        JSON.parse(decodeURIComponent(delegation)),
      );
      console.log("chain",Delchain);
      const middleIdentity = DelegationIdentity.fromDelegation(
        newKeyPair,
        Delchain,
      );
      console.log("middleIdentity",middleIdentity);
      const agent = new HttpAgent({
        identity: middleIdentity,
        fetchOptions: {
            reactNative: {
            __nativeResponseType: 'base64',
            },
        },
        callOptions: {
            reactNative: {
            textStreaming: true,
            },
        },
        blsVerify: () => true,
        host: environment.isTesting?'http://127.0.0.1:4943':'https://icp-api.io',
        });
        console.log("agent",agent)
        let actor
        if(environment.isTesting){
          actor = Actor.createActor(environment.backendIDL,{
            agent,
            blsVerify:()=>true,
            canisterId:environment.backendID
          });
        }else{
          actor = Actor.createActor(idlFactory,{
            agent,
            blsVerify:()=>true,
            canisterId:BACKEND_CANISTER_ID_MAINNET
          });
        }
        console.log("actor",actor.whoami)
        let actorArr=[]
        for(let i=0;i<canisters.length;i++){
          let new_actor = Actor.createActor(canisters[i].idlFactory,{
            agent,
            blsVerify:()=>true,
            canisterId:canisters[i].id
          });
          actorArr.push(new_actor)
        }
        let principle=await actor.whoami()
        return {
          principle:principle,
          actors:[...actorArr],
          found:true
        }
      
    }catch(err){
      console.log(err)
      return {
        msg:"NO previous valid user credentials found!",
        found:false
      }
    }
  }

// handling logout--

export async function handleLogout() {
  return new Promise(async(resolve, reject) => {
    try {
      await AsyncStorage.clear();
  

      // navigation.dispatch(
      //   CommonActions.reset({
      //     index: 0,
      //     routes: [{ name: initialRoute }], 
      //   })
      // );
      NativeModules.DevSettings.reload()
      
      resolve('logout success');
    } catch (error) {
      reject(error);
    }
  });
}

