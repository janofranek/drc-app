import React, {useState, useEffect} from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../cred/firebase';
import { Container, Row, Col, Card, Tabs, Tab, Form, Button } from "react-bootstrap";
import { collection, getDocs } from "firebase/firestore";
import "./LoginRegister.css"
 
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
            <div className="todo-content">
                {
                    props.users?.map((user,i)=>(
                        <p key={i}>
                            {user.email}
                        </p>
                    ))
                }
            </div>
        </div>
    )
}

const LoginRegister = () => {
    //const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState([])
    
    const fetchUsers = async () => {
       
        await getDocs(collection(db, "users"))
            .then((querySnapshot)=>{              
                const newData = querySnapshot.docs
                    .map((doc) => ({...doc.data(), id:doc.id }));
                setUsers(newData);                
            })
       
    }

    useEffect(()=>{
        fetchUsers();
    }, [])

    const onLogin = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            //navigate("/")
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });
       
    }

    const onRegister = async (e) => {
        e.preventDefault()
       
        await createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
              // Signed in
              const user = userCredential.user;
              console.log(user);
              // ...
          })
          .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorCode, errorMessage);
              // ..
          });
    }
 
    return(
        <div>
            <Container fluid>
                <Row className="vh-100 d-flex justify-content-center align-items-center">
                    <Col>
                        <Card className="shadow">
                            <Card.Body>
                                <h2 className="fw-bold mb-2 ">DRCapp</h2>
                                <Tabs fill>
                                    <Tab eventKey="home" title="Přihlášení">
                                        <Login onEmailChange={setEmail} onPasswordChange={setPassword} onLogin={onLogin} />
                                    </Tab>
                                    <Tab eventKey="profile" title="Registrace">
                                        <Register onEmailChange={setEmail} onPasswordChange={setPassword} onRegister={onRegister} users={users}/>
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
 
export default LoginRegister