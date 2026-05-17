import { useState, useEffect } from 'react';
import { db } from '../cred/firebase';
import { collection, onSnapshot } from "firebase/firestore";

export const useFirestoreCollection = (collectionName, errorMessage = "Nepovedlo se načíst data") => {
  const [data, setData] = useState();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, collectionName), (querySnapshot) => {
      const newData = querySnapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }));
      setData(newData);
    }, (error) => {
      console.log(`${errorMessage}: ` + error.message);
    });

    return () => {
      unsubscribe();
      setData(null);
    };
  }, [collectionName, errorMessage]);

  return data;
};
