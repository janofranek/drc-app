import React, {useState, useEffect, useContext} from 'react';
import { db } from '../cred/firebase';
import { collection, onSnapshot } from "firebase/firestore";

const Context = React.createContext();

export const ScorecardsDataProvider = ({ children }) => {
  const [scorecards, setScorecards] = useState();

  useEffect(()=>{
    const unsub = onSnapshot(collection(db, 'scorecards'),
      (snapshot) => {
        const newData = [];
        snapshot.forEach((doc) => {
          newData.push({...doc.data(), id:doc.id })
        });
        setScorecards(newData);
      },
      (error) => {
        console.log("Nepovedlo se načíst skórkarty: " + error.message)
      });
    return () => { 
      unsub();
      setScorecards(null) 
    };
  }, [])

  return (
    <Context.Provider value={scorecards}>
      {children}
    </Context.Provider>
  )
}

export const useScorecards = () => useContext(Context);