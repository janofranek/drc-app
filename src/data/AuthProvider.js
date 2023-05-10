import React, {useState, useEffect, useContext} from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../cred/firebase';
const Context = React.createContext();

export const AuthProvider = ({ children }) => {
  const [authEmail, setAuthEmail] = useState('')

  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
      if (user) { 
        setAuthEmail(user.email)
      } else {
        setAuthEmail(null)
      }
    });
  }, [])

  return (
    <Context.Provider value={authEmail}>
      {children}
    </Context.Provider>
  )
}

export const useAuth = () => useContext(Context);