import React, {useState} from 'react';
import {  signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Tabs, Tab } from "react-bootstrap";
//import { NavLink, useNavigate } from 'react-router-dom'
import "./LoginRegister.css"
 
const Login = (setEmail, setPassword, onLogin) => {
    return(
        <main className="form-signin">
        <form>
            
            <div className="form-floating">
            <input 
                type="email" 
                className="form-control" 
                id="email-address" 
                name="email"
                required
                placeholder="name@example.com"
                onChange={(e)=>setEmail(e.target.value)}/>
            <label htmlFor="email-address">Email</label>
            </div>
            <div className="form-floating">
            <input 
                type="password" 
                className="form-control" 
                id="password"
                name="password"
                required                                                                                
                placeholder="Heslo"
                onChange={(e)=>setPassword(e.target.value)}
            />
            <label htmlFor="password">Heslo</label>
            </div>

            <button className="w-100 btn btn-lg btn-primary" type="submit" onClick={onLogin}>Přihlásit</button>
            
        </form>
        </main>
    )
}

const Register = (setEmail, setPassword, onRegister) => {
    return(
        <main className="form-signin">
        <form>
            
            <div className="form-floating">
            <input 
                type="email" 
                className="form-control" 
                id="email-address" 
                name="email"
                required
                placeholder="name@example.com"
                onChange={(e)=>setEmail(e.target.value)}/>
            <label htmlFor="email-address">Email</label>
            </div>
            <div className="form-floating">
            <input 
                type="password" 
                className="form-control" 
                id="password"
                name="password"
                required                                                                                
                placeholder="Heslo"
                onChange={(e)=>setPassword(e.target.value)}
            />
            <label htmlFor="password">Heslo</label>
            </div>

            <button className="w-100 btn btn-lg btn-primary" type="submit" onClick={onRegister}>Registrovat</button>
            
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
                <Login setEmail={setEmail} setPassword={setPassword} onLogin={onLogin} />
            </Tab>
            <Tab eventKey="profile" title="Registrace">
                <Register setEmail={setEmail} setPassword={setPassword} onRegister={onRegister} />
            </Tab>
        </Tabs>
        </>
    )
}
 
export default LoginRegister