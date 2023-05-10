import React, {useState} from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../cred/firebase';
import { Outlet, Link } from "react-router-dom";
import { Container, Navbar, Nav, Button, Alert } from "react-bootstrap";
import { useUsers } from '../data/UsersDataProvider';
import { useAuth } from '../data/AuthProvider';

const NavText = (props) => {
  if (props.userEmail) {
    return (
      <>
        <Button variant='link' type='submit' onClick={props.onLogout}>Odhlásit</Button>
      </>
    )
  } else {
    return (
      <>
        Nepřihlášen
      </>
    )
  }
}

const Layout = () => {
  const [errorMsg, seterrorMsg] = useState('')

  const users = useUsers();
  const authEmail = useAuth();

  if (!users) return "Loading...";

  const onLogout = async (e) => {
    e.preventDefault()
    signOut(auth)
      .then(() => {
        seterrorMsg(null)
      })
      .catch((error) => {
        seterrorMsg(error.message);
      });
  }

  const checkUserAdmin = () => {
      if (!authEmail || !users) {
          return false
      } else {
          return users.filter(user => user.email.toLowerCase() === authEmail.toLowerCase() && user.admin).length > 0
      }
  }

  return (
      <>
      <Container fluid>
        <Navbar bg="dark" variant="dark" fixed="top">
          <Container>
          <Navbar.Brand>DRCapp</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse className="justify-content-end">
            <Nav className="justify-content-end">
              {authEmail &&
                  <>
                  <Nav.Link as={Link} to="/">Skóre</Nav.Link>
                  <Nav.Link as={Link} to="/stav">Stav</Nav.Link>
                  </>
              }
              {checkUserAdmin() && <Nav.Link as={Link} to="/admin">Admin</Nav.Link>}
            </Nav>
            <Navbar.Text>
              <NavText userEmail={authEmail} onLogout={onLogout}/>
            </Navbar.Text>
          </Navbar.Collapse>
          </Container>
        </Navbar>
        {errorMsg && <Alert variant="danger" className="v-100"><p>{errorMsg}</p></Alert>}
        <Outlet />
      </Container>  
      </>
  )
}

export default Layout;