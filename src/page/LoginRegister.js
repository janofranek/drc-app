import React, {useState} from 'react';
import {  signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Tabs, Tab } from "react-bootstrap";
//import { NavLink, useNavigate } from 'react-router-dom'
import "./LoginRegister.css"
 
const Login = (props) => {
    return(
        <main className="form-signin">
        <form>
            
            <div className="form-floating">
            <input 
                type="email" 
                className="form-control" 
                id="signin-email-address" 
                name="signin-email"
                required
                placeholder="name@example.com"
                onChange={(e)=>props.onEmailChange(e.target.value)}/>
            <label htmlFor="email-address">Email</label>
            </div>
            <div className="form-floating">
            <input 
                type="password" 
                className="form-control" 
                id="signin-password"
                name="signin-password"
                required                                                                                
                placeholder="Heslo"
                onChange={(e)=>props.onPasswordChange(e.target.value)}
            />
            <label htmlFor="password">Heslo</label>
            </div>

            <button className="w-100 btn btn-lg btn-primary" type="submit" onClick={props.onLogin}>Přihlásit</button>
            
        </form>
        </main>
    )
}

const Register = (props) => {
    return(
        <main className="form-signin">
        <form>
            
            <div className="form-floating">
            <input 
                type="email" 
                className="form-control" 
                id="register-email-address" 
                name="register-email"
                required
                placeholder="name@example.com"
                onChange={(e)=>props.onEmailChange(e.target.value)}/>
            <label htmlFor="email-address">Email</label>
            </div>
            <div className="form-floating">
            <input 
                type="password" 
                className="form-control" 
                id="register-password"
                name="register-password"
                required                                                                                
                placeholder="Heslo"
                onChange={(e)=>props.onPasswordChange(e.target.value)}
            />
            <label htmlFor="password">Heslo</label>
            </div>

            <button className="w-100 btn btn-lg btn-primary" type="submit" onClick={props.onRegister}>Registrovat</button>
            
        </form>
        </main>
    )
}

const LoginRegister = () => {
    //const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
       
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
        <>
        <h1 className="h3 mb-3 fw-normal">DRCapp - Přihlášení</h1>
        <Tabs>
            <Tab eventKey="home" title="Přihlášení">
                <Login onEmailChange={setEmail} onPasswordChange={setPassword} onLogin={onLogin} />
            </Tab>
            <Tab eventKey="profile" title="Registrace">
                <Register onEmailChange={setEmail} onPasswordChange={setPassword} onRegister={onRegister} />
            </Tab>
        </Tabs>
        </>
    )
}
 
export default LoginRegister