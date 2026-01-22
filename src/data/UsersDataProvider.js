import React, { useContext } from 'react';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

const Context = React.createContext();

export const UsersDataProvider = ({ children }) => {
  const users = useFirestoreCollection("users", "Nepovedlo se načíst uživatele");

  return (
    <Context.Provider value={users}>
      {children}
    </Context.Provider>
  )
}

export const useUsers = () => useContext(Context);