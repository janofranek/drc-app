import React, {useState, useEffect, useContext} from 'react';
import { db } from '../cred/firebase';
import { collection, onSnapshot } from "firebase/firestore";

const Context = React.createContext();

export const MatchesDataProvider = ({ children }) => {
  const [matches, setMatches] = useState();

  useEffect(()=>{
    const unsub = onSnapshot(collection(db, 'matches'),
      (snapshot) => {
        const newData = [];
        snapshot.forEach((doc) => {
          newData.push({...doc.data(), id:doc.id })
        });
        setMatches(newData);
      },
      (error) => {
        console.log("Nepovedlo se načíst zápasy: " + error.message)
      });
    return () => { 
      unsub();
      setMatches(null) 
    };
  }, [])

  return (
    <Context.Provider value={matches}>
      {children}
    </Context.Provider>
  )
}

export const useMatches = () => useContext(Context);