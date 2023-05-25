import React from 'react';
import { Navigate, Link } from "react-router-dom";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import logoStt from "../assets/DRCstandard.png"
import logoLat from "../assets/DRClatin.png"

const Home = () => {

  //load data
  const authEmail = useAuth();

  //if not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th colSpan={2}><div className="centeralign">Dance Ryder Cup 2023 - Kácov - 1.9-3.9</div></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="drcimage"><img src={logoStt} alt="DRC logo standard" /></td>
            <td className="drcimage"><img src={logoLat} alt="DRC logo latin" /></td>
          </tr>
          <tr>
            <td colSpan={2}><div className="centeralign"><Link to="/history"> Minulé turnaje </Link></div></td>
          </tr>
        </tbody>
      </table>
    </>
  )

}

export default Home