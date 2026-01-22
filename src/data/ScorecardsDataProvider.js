import React, { useContext } from 'react';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

const Context = React.createContext();

export const ScorecardsDataProvider = ({ children }) => {
  const scorecards = useFirestoreCollection("scorecards", "Nepovedlo se načíst skórkarty");

  return (
    <Context.Provider value={scorecards}>
      {children}
    </Context.Provider>
  )
}

export const useScorecards = () => useContext(Context);