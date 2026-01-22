import React, { useContext } from 'react';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

const Context = React.createContext();

export const CoursesDataProvider = ({ children }) => {
  const courses = useFirestoreCollection("courses", "Nepovedlo se načíst hřiště");

  return (
    <Context.Provider value={courses}>
      {children}
    </Context.Provider>
  )
}

export const useCourses = () => useContext(Context);