import React from 'react';
import { Navigate, Link } from "react-router-dom";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import { useMatches } from "../data/MatchesDataProvider"
import { useTournaments } from '../data/TournamentsDataProvider';
import { getLastRyderMatch } from "./Utils"
import { StavRyderMatchTotal } from "./StavRyderMatch"

const HomePage = (props) => {

  const lastRyderMatch = getLastRyderMatch(props.tournaments)

  return (
    <>
      <StavRyderMatchTotal tournament={lastRyderMatch} matches={props.matches}/>
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

  if(!matches || !tournaments) {
    return ("Loading .. .Home Page ... waiting for data")
  }

  return (
    <>
      <HomePage matches={matches} tournaments={tournaments}/>
    </>
  )

}

export default Home