import React, {useState} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';

const Logout = () => {
    const navigate = useNavigate();

    const onLogout = async (e) => {
        e.preventDefault()
        signOut(auth)
            .then(() => {
                // Sign-out successful.
            })
            .catch((error) => {
                // An error happened.
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
            });
    }

    return (
        <section>
            <h1> DRCapp </h1>
            <form>                                                                                            
                <button
                    type="submit" 
                    onClick={onLogout}                        
                >  
                    Log out                                
                </button>
                                                                
            </form>
        </section>

    )

}

export default Logout