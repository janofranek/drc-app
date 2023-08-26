import React, {useMemo} from 'react';
import { Navigate, Link } from "react-router-dom";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import logoStt from "../assets/DRCstandard.png"
import logoLat from "../assets/DRClatin.png"
import { useMatches } from "../data/MatchesDataProvider"
import { formatRyderStatus } from "./Utils"

const Home = () => {

  //load data
  const authEmail = useAuth();
  const matches = useMatches();

  const ryderMatchStatus = useMemo(
    () => {
      const sttFinal = matches
          .filter( m => m.final && m.final_score <= 0 )
          .reduce((a ,v) =>  a = a + ( v.final_score === -1 ? 1.0 : 0.5 ) , 0.0)
      const latFinal = matches
          .filter( m => m.final && m.final_score >= 0 )
          .reduce((a ,v) =>  a = a + ( v.final_score === 1 ? 1.0 : 0.5 ) , 0.0)
      const liveMatches = matches.filter( m => !m.final && m.holes.length > 0 )
      let sttPrelim = sttFinal;
      let latPrelim = latFinal;
      for (const m of liveMatches) {
        const liveScore = m.holes.reduce((a, v) => a += (v ?? 0), 0)
        if ( liveScore < 0 ) {
          sttPrelim += 1.0;
        } else if ( liveScore > 0 ) {
          latPrelim += 1.0;
        } else {
          sttPrelim += 0.5;
          latPrelim += 0.5;
        }
      }

      return {
        "sttFinal": sttFinal,
        "latFinal": latFinal,
        "sttPrelim": sttPrelim,
        "latPrelim": latPrelim,
      }
    },
    [matches]
  )

  //if not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  if(!matches) {
    return ("Loading...")
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

export default Home