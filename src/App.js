import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect } from 'react'
import SplashScreen from 'react-native-splash-screen'
import { useRoute } from '@react-navigation/native'
import { UserContext } from '../index'
import { idlFactory } from './declarations/backend'

const App = ({navigation}) => {

  const route=useRoute()
  const {handleLogin, handleLogout,autoLogin}=route.params
  const {user,setUser,isAuthenticated,setIsAuthenticated} =useContext(UserContext)
  const canisters=[
    {
      idlFactory:idlFactory,
      id:"a4tbr-q4aaa-aaaaa-qaafq-cai"
    }
  ]
  const environment={
    isTesting:false,
    middlepageID:"a3shf-5eaaa-aaaaa-qaafa-cai",
    backendID:"a4tbr-q4aaa-aaaaa-qaafq-cai",
    backendIDL:idlFactory
  }


  const login=async()=>{
    
    let newLUser=await handleLogin(environment,canisters,'example')
    console.log(newLUser)
    if(newLUser.principle){
      setUser(newLUser.principle)
      setIsAuthenticated(true)
    }
    
  }

  // logout
  const logout=async()=>{
    const initialRoute = 'Launch';
    let res=await handleLogout()
    console.log(res)
    setUser("Not logged in yet!")
    setIsAuthenticated(false)
  }
  const automaticLogin=async()=>{
    setUser("Fetching user details")
    let res=await autoLogin(environment,canisters)
    console.log(res)
    if(res.found){
      setUser(res.principle)
      setIsAuthenticated(true)
    }else{
      setUser("No previous user data found!")
    }
    
  }
  useEffect(()=>{
    SplashScreen.hide()
    automaticLogin()
  },[])


  return (
    <View style={styles.app}>
      <Text style={styles.text}>RN IID test auth</Text>
      <Text style={styles.normalText}>Principal : {"\n\n"+user}</Text>
      {
        isAuthenticated?
        <TouchableOpacity style={[styles.btn,{marginTop:20}]} onPress={logout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
        :
        <TouchableOpacity style={styles.btn} onPress={login}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>
      }
      
      
    </View>
  )
}

export default App

const styles = StyleSheet.create({
    app:{
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        height:'100%',
        backgroundColor:'white'
    },
    btn:{
        paddingHorizontal:10,
        paddingVertical:15,
        backgroundColor:'blue',
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:10,
        width:'30%'
    },
    btnText:{
        color:'white',
        fontSize:19,
        fontWeight:'bold'
    },
    text:{
        position:'absolute',
        top:30,
        marginBottom:30,
        fontSize:28,
        fontWeight:'bold',
        color:'black',
        
    },
    normalText:{
      marginBottom:30,
        fontSize:16,
        fontWeight:'bold',
        color:'black',
        maxWidth:'70%',
        textAlign:'center'
    }
})