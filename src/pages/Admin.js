import React from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import "../components/Common.css"
import { useAuth } from '../data/AuthProvider';






const Admin = () => {
  //load data
  const authEmail = useAuth();

  // If not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Container fluid className="mt-3">
        <Outlet />
      </Container>
    </div>
  )
}

export default Admin