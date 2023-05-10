import React from 'react';
import { Navigate  } from "react-router-dom";
import { Container } from "react-bootstrap";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';


const Stav = () => {
  const authEmail = useAuth();

  // If not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Container class="pt-5 border">
        Future Stav page
      </Container> 

      <div class="container p-5 my-5 border">
        <h1>My First Bootstrap Page</h1>
        <p>This container has a border and some extra padding and margins.</p>
      </div>

      <div class="container p-5 my-5 border">
        <h1>My First Bootstrap Page</h1>
        <p>This container has a border and some extra padding and margins.</p>
      </div>

    </>
  )
}
 
export default Stav