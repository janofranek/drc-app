import React, {useState, useEffect} from 'react';
import Home from './page/Home';
import LoginRegister from './page/LoginRegister';
import { BrowserRouter as Router} from 'react-router-dom';
import {Routes, Route} from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase';

function App() {

  const [uid, setUid] = useState('')
  const [email, setEmail] = useState('')

  useEffect(()=>{
      onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            setUid(user.uid);
            setEmail(user.email)
            // ...
            console.log("user is logged in", uid)
          } else {
            setUid(null);
            setEmail(null)
            // User is signed out
            // ...
            console.log("user is logged out")
          }
        });
       
  }, [])

  let showPage;
  if (uid) {
    showPage = <Home userUid={uid} userEmail={email}/>;
  } else {
    showPage = <LoginRegister/>;
  }

  return (
    <>
    {showPage}
    </>
  )
      
}
 
export default App;
