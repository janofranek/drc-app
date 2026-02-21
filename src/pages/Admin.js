import React from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import "../components/Common.css"
import { useAuth } from '../data/AuthProvider';
import { useUsers } from '../data/UsersDataProvider';
import { checkUserAdmin } from '../utils/Utils';

const Admin = () => {
  //load data
  const authEmail = useAuth();
  const users = useUsers();

  if (!users) return "Loading ... Admin ... waiting for users";

  // If not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  // If not admin, redirect to home page
  if (!checkUserAdmin(authEmail, users)) {
    return <Navigate to="/" />;
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