import React, { useState, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import Button from 'react-bootstrap/Button'
 
const Home = (props) => {

  const onLogout = async (e) => {
    e.preventDefault()
    signOut(auth)
        .then(() => {
            // Sign-out successful.
        })
        .catch((error) => {
            // An error happened.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
  }

  return (
      <section>        
      <h1> DRCapp </h1>
      <p>
          User: {props.userEmail}
      </p>
      <p>
          UserID: {props.userUid}
      </p>
      <Button variant="link" type="submit" onClick={onLogout}>Odhlásit</Button>
    </section>
  )
}
 
export default Home