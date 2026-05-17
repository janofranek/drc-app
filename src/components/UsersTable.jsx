import React, { useState } from 'react';
import { Table, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { auth } from '../cred/firebase';
import { useUsers } from '../data/UsersDataProvider';
import UserModal from './UserModal';
import { deleteUser, sendUserPasswordReset } from '../utils/Utils';

const UsersTable = () => {
  const users = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  if (!users) return "Loading..."

  const handleAdd = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Opravdu chcete smazat uživatele ${user.name}?`)) {
      try {
        await deleteUser(user.id);
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Nepodařilo se smazat uživatele.");
      }
    }
  };

  const handleReset = async (user) => {
    if (window.confirm(`Opravdu chcete zaslat email pro obnovu hesla uživateli ${user.name}?`)) {
      try {
        await sendUserPasswordReset(user.email);
        alert(`Email pro obnovu hesla byl odeslán na ${user.email}`);
      } catch (error) {
        console.error("Error sending password reset:", error);
        alert("Nepodařilo se odeslat email pro obnovu hesla: " + error.message);
      }
    }
  };

  const handleClose = () => setShowModal(false);

  return (
    <>
      <div className="mb-3 d-flex justify-content-end">
        <Button variant="success" onClick={handleAdd}>+ Přidat uživatele</Button>
      </div>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Zkratka</th>
            <th>Jméno</th>
            <th>E-mail</th>
            <th>HCP</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {users.map((row, index) => {
            return <tr key={"users_row_" + index}>
              <td>{row.id}</td>
              <td>{row.short}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.hcp}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleReset(row)} title="Resetovat heslo">Reset hesla</Button>
                <Button variant="primary" size="sm" className="me-2" onClick={() => handleEdit(row)}>Upravit</Button>
                {auth.currentUser && auth.currentUser.email === row.email ? (
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Nemůžete smazat sami sebe</Tooltip>}
                  >
                    <span className="d-inline-block">
                      <Button variant="secondary" size="sm" disabled style={{ pointerEvents: 'none' }}>Smazat</Button>
                    </span>
                  </OverlayTrigger>
                ) : (
                  <Button variant="danger" size="sm" onClick={() => handleDelete(row)}>Smazat</Button>
                )}
              </td>
            </tr>;
          })}
        </tbody>
      </Table>
      <UserModal show={showModal} handleClose={handleClose} user={selectedUser} />
    </>
  )
}

export default UsersTable;
