import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../cred/firebase';
import { Button, Tabs, Tab, Row, Col, Card, Container, Alert, Navbar } from 'react-bootstrap'

const Skore = (props) => {
  return(
    <div>
      <p>
        Zde bude skóre a jeho zadávání
      </p>
    </div>
  )
}

const Stav = (props) => {
  return(
      <div>
        <p>
          Zde bude stav turnaje
        </p>
      </div>
  )
}
const Home = (props) => {

  const [errorMsg, seterrorMsg] = useState('')

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

  return (
    <div>

      <Navbar bg="light" variant="light" fixed="top">
        <Container>
          <Navbar.Brand>DRCapp</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              {props.userEmail} <Button variant="link" type="submit" onClick={onLogout}>Odhlásit</Button>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid>
        <Row className="vh-100 d-flex justify-content-center align-items-center">
          <Col>
            <Card className="shadow" style={{ width: '20rem' }}>
              <Card.Body>
                <Tabs fill>
                  <Tab eventKey="home" title="Skóre">
                    <Skore/>
                  </Tab>
                  <Tab eventKey="profile" title="Stav">
                    <Stav/>
                  </Tab>
                </Tabs>
              </Card.Body>
              {errorMsg && <Alert variant="danger" className="v-100"><p>{errorMsg}</p></Alert>}
            </Card>
          </Col>
        </Row>
      </Container>

    </div>
  )
}
 
export default Home