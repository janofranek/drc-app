import React from 'react';
import { Alert } from "react-bootstrap";


const NoActiveTournament = () => {

  return (
    <>
      <Alert variant="primary" className="v-100">
        <Alert.Heading>Teď zde nic není</Alert.Heading>
        <p>Aktuálně nehrajeme žádný turnaj. Až se zase bude nějaký blížit, zase zde něco bude.</p>
      </Alert>
    </>
  )
}
 
export default NoActiveTournament