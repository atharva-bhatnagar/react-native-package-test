import {
    DelegationIdentity,
    ECDSAKeyIdentity,
    DelegationChain,
  } from '@dfinity/identity';
import {Actor, HttpAgent, toHex, fromHex, blsVerify} from '@dfinity/agent';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import { Linking } from 'react-native';
import { errors } from './types/errors';
import AsyncStorage from '@react-native-async-storage/async-storage'
global.Buffer = require('buffer').Buffer;

let generatedKeyPair


export async function handleLogin(testing,idlFactories,canisterIDs){
  return new Promise(async(resolve,reject)=>{
    let baseURL=testing?"http://127.0.0.1:4943/?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai&":"https://sldpd-dyaaa-aaaag-acifq-cai.icp0.io?"
    let host=testing?"http://127.0.0.1:4943":"https://icp-api.io"
    await ECDSAKeyIdentity.generate({extractable: true}).then(async(keyp)=>{

    generatedKeyPair=keyp
    console.log('running handle login', keyp);
    try {
      const url = `${baseURL}publicKey=${toHex(
        keyp.getPublicKey().toDer(),
      )}`;
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
            let newRes=await handleDeepLink(event,idlFactories,canisterIDs)
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

  async function handleDeepLink(event,idlFactories,canisterIDs){
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
        host: 'http://127.0.0.1:4943',
        });
        // let pubKey = toHex(await crypto.subtle.exportKey("pkcs8",middleIdentity._inner._keyPair.publicKey));
        // let priKey = toHex(await crypto.subtle.exportKey("pkcs8",middleIdentity._inner._keyPair.privateKey));
        console.log("agent",agent)
        let actor = Actor.createActor(idlFactories[0],{
          agent,
          blsVerify:()=>true,
          canisterId:canisterIDs[0]
        });
        console.log("actor",actor.whoami)
        let actorArr=[]
        for(let i=1;i<idlFactories.length;i++){
          let new_actor = Actor.createActor(idlFactories[i],{
            agent,
            blsVerify:()=>true,
            canisterId:canisterIDs[i]
          });
          actorArr.push(new_actor)
        }

        let principle=await actor.whoami()
        return {
          principle:principle,
          actors:[actor,...actorArr]
        }
        // storeInAsyncStorage("pubkey",pubKey)
        // storeInAsyncStorage("prikey",priKey)
        // storeInAsyncStorage("delegation",delegation)
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

  async function delegationValidation(pubKey,priKey,delegation,setUser){
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
          host: 'http://127.0.0.1:4943',
          });
          console.log("agent",agent)
          let actor = Actor.createActor(idlFactory,{
            agent,
            blsVerify:()=>true,
            canisterId:'bd3sg-teaaa-aaaaa-qaaba-cai'
          });
          console.log("actor",actor.whoami)
  
          await actor.whoami().then((u)=>{
              console.log(u)
              setUser(u)
              console.log('whoami', u);
              return u
          }).catch((err)=>{
              console.log(err)
  
          });
        
      }catch(err){
        console.log(err)
      }
    }

    export async function autoLogin(setUser){
      let pub=getFromAsyncStore("pubkey")
      let pri=getFromAsyncStore("prikey")
      let del=getFromAsyncStore("delegation")
      delegationValidation(pub,pri,del)
    }