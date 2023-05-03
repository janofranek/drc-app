import React, {useState, useEffect} from 'react';
import Home from './page/Home';
import LoginRegister from './page/LoginRegister';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './cred/firebase';

function App() {

  const [uid, setUid] = useState('')
  const [email, setEmail] = useState('')

  useEffect(()=>{
      onAuthStateChanged(auth, (user) => {
          if (user) { 
            setUid(user.uid);
            setEmail(user.email)
          } else {
            setUid(null);
            setEmail(null)
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
