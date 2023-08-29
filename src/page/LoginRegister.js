import React, {useState} from 'react';
import { Navigate  } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../cred/firebase';
import { Alert, Container, Card, Tabs, Tab, Form, Button } from "react-bootstrap";
import "./Common.css"
import { useUsers } from '../data/UsersDataProvider';
import { useAuth } from '../data/AuthProvider';
 
const Login = (props) => {
    return(
        <div className="form-signin">
            <Form>
                <Form.Group className="mb-3">
                    <Form.Control 
                        className="form-control"
                        type="email" 
                        placeholder="Email" 
                        id="signin-email-address"
                        name="signin-email" 
                        required 
                        onChange={(e)=>props.onEmailChange(e.target.value)}/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Control 
                        type="password" 
                        className="form-control" 
                        id="signin-password"
                        name="signin-password"
                        required                                                                                
                        placeholder="Heslo"
                        onChange={(e)=>props.onPasswordChange(e.target.value)}/>
                </Form.Group>
                <Button 
                    variant="primary" 
                    className="w-100 btn btn-lg btn-primary"
                    type="submit"
                    onClick={props.onLogin}>
                    Přihlásit
                </Button>

            </Form>
        </div>
    )
}

const Register = (props) => {
    return(
        <div className="form-signin">
            <Form>
                <Form.Group className="mb-3">
                    <Form.Control 
                        type="email" 
                        className="form-control" 
                        id="register-email-address" 
                        name="register-email"
                        required
                        placeholder="Email"
                        onChange={(e)=>props.onEmailChange(e.target.value)}/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Control 
                        type="password" 
                        className="form-control" 
                        id="register-password"
                        name="register-password"
                        required                                                                                
                        placeholder="Heslo"
                        onChange={(e)=>props.onPasswordChange(e.target.value)}/>
                    <Form.Text className="text-muted">
                        Heslo musí mít alespoň 6 znaků
                    </Form.Text>
                </Form.Group>
                <Button 
                    variant="primary" 
                    className="w-100 btn btn-lg btn-primary"
                    type="submit"
                    onClick={props.onRegister}>
                    Registrovat
                </Button>
            </Form>
        </div>
    )
}

const LoginRegister = () => {
    //const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, seterrorMsg] = useState('');

    const authEmail = useAuth();
    const users = useUsers();

    if (!users) return "Loading ... LoginRegister page ... waiting for users";

    // If already logged in, redirect to login page
    if (authEmail) {
        return <Navigate to="/" />;
    }
      
    const onLogin = (e) => {
        e.preventDefault();
        const emailLC = email.toLowerCase()
        signInWithEmailAndPassword(auth, emailLC, password)
        .then((userCredential) => {
            seterrorMsg(null)
        })
        .catch((error) => {
            seterrorMsg(error.message);
        });
       
    }

    const checkUserInList = (email) => {
        return users.filter(user => user.email.toLowerCase() === email.toLowerCase()).length > 0
    }

    const onRegister = async (e) => {
        e.preventDefault()

        if (checkUserInList(email)) {

            const emailLC = email.toLowerCase()
            await createUserWithEmailAndPassword(auth, emailLC, password)
            .then((userCredential) => {
                seterrorMsg(null);
            })
            .catch((error) => {
                seterrorMsg(error.message);
                console.log(error.message)
            });
        } else {
            seterrorMsg("Tento e-mail neznám. Pokud chceš přístup, napiš Janovi");
        }
    }

    return(
      <div>
        <Container fluid>
          <Card className="shadow" style={{ width: '20rem' }}>
            <Card.Body>
              <Tabs fill>
                <Tab eventKey="home" title="Přihlášení">
                  <Login onEmailChange={setEmail} onPasswordChange={setPassword} onLogin={onLogin} />
                </Tab>
                <Tab eventKey="profile" title="Registrace">
                  <Register onEmailChange={setEmail} onPasswordChange={setPassword} onRegister={onRegister}/>
                </Tab>
              </Tabs>
            </Card.Body>
            {errorMsg && <Alert variant="danger" className="v-100"><p>{errorMsg}</p></Alert>}
          </Card>
        </Container>
      </div>
    )
}
 
export default LoginRegister