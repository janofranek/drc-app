import React, {useState, useEffect, useContext} from 'react';
import { db } from '../cred/firebase';
import { collection, getDocs } from "firebase/firestore";

const Context = React.createContext();

export const CoursesDataProvider = ({ children }) => {
  const [courses, setCourses] = useState();

  const fetchCourses = async () => {
       
    await getDocs(collection(db, "courses"))
        .then((querySnapshot)=>{              
            const newData = querySnapshot.docs
                .map((doc) => ({...doc.data(), id:doc.id }));
            setCourses(newData);      
        })
  }

  useEffect( () => {
    fetchCourses();
    return () => { setCourses(null) };
  }, [])

  return (
    <Context.Provider value={courses}>
      {children}
    </Context.Provider>
  )
}

export const useCourses = () => useContext(Context);