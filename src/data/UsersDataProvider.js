import React, {useState, useEffect, useContext} from 'react';
import { db } from '../cred/firebase';
import { collection, getDocs } from "firebase/firestore";

const Context = React.createContext();

export const UsersDataProvider = ({ children }) => {
  const [users, setUsers] = useState();

  const fetchUsers = async () => {
       
    await getDocs(collection(db, "users"))
        .then((querySnapshot)=>{              
            const newData = querySnapshot.docs
                .map((doc) => ({...doc.data(), id:doc.id }));
            setUsers(newData);      
        })
  }

  useEffect( () => {
    fetchUsers();
    return () => { setUsers(null) };
  }, [])

  return (
    <Context.Provider value={users}>
      {children}
    </Context.Provider>
  )
}

export const useUsers = () => useContext(Context);