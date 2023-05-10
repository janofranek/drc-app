import React, {useState, useEffect, useContext} from 'react';
import { db } from '../cred/firebase';
import { collection, getDocs } from "firebase/firestore";

const Context = React.createContext();

export const TournamentsDataProvider = ({ children }) => {
  const [tournaments, setTournaments] = useState();

  const fetchTournaments = async () => {
       
    await getDocs(collection(db, "tournaments"))
        .then((querySnapshot)=>{              
            const newData = querySnapshot.docs
                .map((doc) => ({...doc.data(), id:doc.id }));
            setTournaments(newData);      
        })
  }

  useEffect( () => {
    fetchTournaments();
    return () => { setTournaments(null) };
  }, [])

  return (
    <Context.Provider value={tournaments}>
      {children}
    </Context.Provider>
  )
}

export const useTournaments = () => useContext(Context);