import {
    DelegationIdentity,
    ECDSAKeyIdentity,
    DelegationChain,
  } from '@dfinity/identity';
import {Actor, HttpAgent, toHex, fromHex} from '@dfinity/agent';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import {createActor,backend} from './declarations/backend';
import { Linking } from 'react-native';
import { errors } from './types/errors';

let generatedKeyPair

export const handleLogin = async (setUser) => {
    await ECDSAKeyIdentity.generate({extractable: true}).then(async(keyp)=>{

    generatedKeyPair=keyp
    console.log('running handle login', keyp);
    try {
      const url = `http://127.0.0.1:4943/?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai&publicKey=${toHex(
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
        Linking.addEventListener('url', (event)=>handleDeepLink(event,setUser));
        await this.sleep(800);
      } else Linking.openURL(url);
    } catch (error) {
      console.log(error);
      new Error(errors.deeplinkErr)
    }
  }).catch((err)=>{
    console.log(err)
    new Error(errors.keygenerationErr)
  })
    
  };

  const handleDeepLink = async (event,setUser) => {
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
        console.log("agent",agent)
        let actor = createActor('bd3sg-teaaa-aaaaa-qaaba-cai', {
        agent,
        });
        console.log("actor",actor.whoami)

        await actor.whoami().then((u)=>{
            console.log(u)
            setUser(u)
            console.log('whoami', u);
        }).catch((err)=>{
            console.log(err)
            new Error(errors.actorCallingErr)
        });
    }catch(err){
        new Error(errors.agentCreationErr)
    }
    
  };

  async function delegationValidation(pubKey,priKey,delegation){
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
        const agent = new HttpAgent({identity: middleIdentity,fetchOptions: {
          reactNative: {
            __nativeResponseType: 'base64',
          },
        },
        callOptions: {
          reactNative: {
            textStreaming: true,
          },
        },
        fetch,
        blsVerify: () => true,
        host: host,
        verifyQuerySignatures: false,
      });
  
        newActor = createActor(ids.backendCan, {
          agent,
        });
  
        console.log("middleIdentityy",middleIdentity.getPrincipal().toString())
  
        let principal = await newActor?.whoami().catch(async(err)=>{
          console.log(err)
        })
        console.log(`principal from del validation : ${principal}`)
        if(principal=="2vxsx-fae"){
          await AsyncStorage.clear()
        }else{
          btmSheetLoginRef.current.dismiss()
        }
        let actorUser=createUserActor(ids.userCan,{agent})
        let actorHotel=createHotelActor(ids.hotelCan,{agent})
        let actorBooking=createBookingActor(ids.bookingCan,{agent})
        let actorToken=Actor.createActor(idlFactory, {
          agent,
          blsVerify:()=>true,
          canisterId:ids.tokenCan
        })
        let actorReview=createReviewActor(ids.reviewCan,{agent})
        let actorComment=createCommentActor(ids.commentCan,{agent})
        store.dispatch(setActor({
          backendActor:newActor,
          userActor:actorUser,
          hotelActor:actorHotel,
          bookingActor:actorBooking,
          tokenActor:actorToken,
          reviewActor:actorReview,
          commentActor:actorComment
        })) 
        
        store.dispatch(setPrinciple(principal))
        console.log("user",principal)
      
  
        await actorUser?.getUserInfo().then((res)=>{
          if(res[0]?.firstName!=null){
            store.dispatch(setUser(res[0]))
            btmSheetLoginRef.current.dismiss()
            alert(`welcome back ${res[0]?.firstName}!`)
            
          }else{
            alert('Now please follow the registeration process!')
            btmSheetLoginRef.current.dismiss()
            btmSheetFinishRef.current.present()
          }
        }).catch((err)=>console.error(err))
        console.log("principal from new login : ",principal);
        
      }catch(err){
        console.log(err)
      }
    }