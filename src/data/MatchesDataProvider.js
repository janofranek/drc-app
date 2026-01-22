import React, { useContext } from 'react';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

const Context = React.createContext();

export const MatchesDataProvider = ({ children }) => {
  const matches = useFirestoreCollection("matches", "Nepovedlo se načíst zápasy");

  return (
    <Context.Provider value={matches}>
      {children}
    </Context.Provider>
  )
}

export const useMatches = () => useContext(Context);