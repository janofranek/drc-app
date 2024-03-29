import React, {useMemo} from 'react';
import { Navigate, Link } from "react-router-dom";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import logoStt from "../assets/DRCstandard.png"
import logoLat from "../assets/DRClatin.png"
import { useMatches } from "../data/MatchesDataProvider"
import { formatRyderStatus, getRyderStandings } from "./Utils"

const HomePage = (props) => {

  const ryderMatchStatus = useMemo(
    () => { 
      return getRyderStandings(props.matches);
    },
    [props]
  )

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
            <td><img className="drcimage" src={logoStt} alt="DRC logo standard" /></td>
            <td><img className="drcimage" src={logoLat} alt="DRC logo latin" /></td>
          </tr>
        </tbody>
      </table>
      <div className="ryder-score-table">
      <table>
        <tbody>
          <tr>
            <td colSpan={2}>Stav</td>
          </tr>
          <tr>
            <td><div className="ryder-score-total stt-final">{formatRyderStatus(ryderMatchStatus.sttFinal)}</div></td>
            <td><div className="ryder-score-total lat-final">{formatRyderStatus(ryderMatchStatus.latFinal)}</div></td>
          </tr>
          <tr>
            <td colSpan={2}>Průběžný stav</td>
          </tr>
          <tr>
            <td><div className="ryder-score-total stt-prelim">{formatRyderStatus(ryderMatchStatus.sttPrelim)}</div></td>
            <td><div className="ryder-score-total lat-prelim">{formatRyderStatus(ryderMatchStatus.latPrelim)}</div></td>
          </tr>
        </tbody>
      </table>
      </div>
      <div className="home-footer">
      <Link to="/history"> Minulé turnaje </Link>
      </div>
    </>
  )

}

const Home = () => {

  //load data
  const authEmail = useAuth();
  const matches = useMatches();

  //if not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  if(!matches) {
    return ("Loading .. .Home Page ... waiting for matches")
  }

  return (
    <>
      <HomePage matches={matches}/>
    </>
  )

}

export default Home