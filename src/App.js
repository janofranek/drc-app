import React, {useState, useEffect} from 'react';
import Home from './page/Home';
import LoginRegister from './page/LoginRegister';
import Logout from './page/Logout';
import { BrowserRouter as Router} from 'react-router-dom';
import {Routes, Route} from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase';

function App() {

  const uid = null
  const [email, setEmail] = useState('')

  useEffect(()=>{
      onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            uid = user.uid;
            setEmail(user.email)
            // ...
            console.log("uid", uid)
          } else {
            uid = null
            setEmail(null)
            // User is signed out
            // ...
            console.log("user is logged out")
          }
        });
       
  }, [])

  if (uid) {
    return (<Home/>)
  } else {
    return (<LoginRegister/>)
  }
      
}
 
export default App;
