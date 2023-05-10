import React from 'react';
import { Navigate  } from "react-router-dom";
import { Table } from "react-bootstrap";
import "./Common.css"
import { useUsers } from '../data/UsersDataProvider';
import { useAuth } from '../data/AuthProvider';


const UsersTable = () => {
  const users = useUsers();

  if (!users) return "Loading..."


  return (
    <>
      <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>E-mail</th>
          <th>HCP</th>
        </tr>
      </thead>
      <tbody>
        {users.map((row, index) => {
          return <tr>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.hcp}</td>
            </tr>;
          })}
      </tbody>
      </Table>
    </>
  )
}


const Admin = () => {
  const authEmail = useAuth();

  // If not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <UsersTable />
    </div>
  )
}
 
export default Admin