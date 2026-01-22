import React from 'react';
import { Navigate, Link } from "react-router-dom";
import "../components/Common.css"
import { useAuth } from '../data/AuthProvider';
import { useMatches } from "../data/MatchesDataProvider"
import { useTournaments } from '../data/TournamentsDataProvider';
import { getLastRyderMatch } from "../utils/Utils"
import { RyderMatchStandingsTotal } from "../components/StandingsRyderMatch"

const HomePage = (props) => {

  const lastRyderMatch = getLastRyderMatch(props.tournaments)

  if (!lastRyderMatch) {
    return (
      <>
        <div className="home-footer">
          <Link to="/history"> Minulé turnaje </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <RyderMatchStandingsTotal tournament={lastRyderMatch} matches={props.matches} />
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
  const tournaments = useTournaments();


  //if not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  if (!matches || !tournaments) {
    return ("Loading .. .Home Page ... waiting for data")
  }

  return (
    <>
      <HomePage matches={matches} tournaments={tournaments} />
    </>
  )

}

export default Home