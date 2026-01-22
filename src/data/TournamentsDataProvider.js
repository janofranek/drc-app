import React, { useContext } from 'react';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

const Context = React.createContext();

export const TournamentsDataProvider = ({ children }) => {
  const tournaments = useFirestoreCollection("tournaments", "Nepovedlo se načíst turnaje");

  return (
    <Context.Provider value={tournaments}>
      {children}
    </Context.Provider>
  )
}

export const useTournaments = () => useContext(Context);