import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect } from 'react'
import SplashScreen from 'react-native-splash-screen'
import { useRoute } from '@react-navigation/native'
import { UserContext } from '../index'
import RNRestart from 'react-native-restart/src'

const App = () => {

  const route=useRoute()
  const {handleLogin}=route.params
  // const {user}=route.params
  const {user,setUser} =useContext(UserContext)
  useEffect(()=>{
    SplashScreen.hide()
  },[])


  return (
    <View style={styles.app}>
      <Text style={styles.text}>React native login Test</Text>
      <Text style={styles.normalText}>Principal : {"\n\n"+user}</Text>
      <TouchableOpacity style={styles.btn} onPress={()=>{handleLogin(setUser)}}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={[styles.btn,{marginTop:20}]} onPress={()=>{RNRestart?.restart()}}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity> */}
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
        borderRadius:40,
        width:'25%'
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