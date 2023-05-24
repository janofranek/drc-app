import React from 'react';
import { Navigate, Link } from "react-router-dom";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';

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
            <td className="drcimage"><img src="/DRCstandard.svg" alt="DRC logo standard" width="150" height="150" /></td>
            <td className="drcimage"><img src="/DRClatin.svg" alt="DRC logo latin" width="150" height="150" /></td>
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