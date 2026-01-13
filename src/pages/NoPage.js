import React from 'react';
import { Link  } from "react-router-dom";
import { Alert } from "react-bootstrap";


const NoPage = () => {

  return (
    <>
      <Alert variant="danger" className="v-100"><p>Neznámá stránka</p></Alert>
      <Link to="/"> Home </Link>
    </>
  )
}
 
export default NoPage