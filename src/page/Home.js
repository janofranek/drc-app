import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
 
const Home = () => {

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
 
  return (
      <section>        
      <h1> DRCapp </h1>
      <p>
          User: {email}
      </p>
      <div className="App min-vh-100 d-flex justify-content-center align-items-center">
    </div>
    </section>
  )
}
 
export default Home