import React from 'react';
import { Navigate } from "react-router-dom";
import { Accordion, Alert } from "react-bootstrap";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { useMatches } from "../data/MatchesDataProvider"
import { StavStblJednotlivci, StavStblTymy } from "./StavStableford"
import { StavRyderMatchTotal, StavRyderMatchDetail } from "./StavRyderMatch"

const HistoryOneTournament = (props) => {

  if (props.tournament.system === "stableford") {
    return (
      <>
        <StavStblJednotlivci tournamentId={props.tournament.id}/>
        <StavStblTymy tournamentId={props.tournament.id}/>
      </>
    )
  } else if (props.tournament.system === "rydercup") {
    return (
      <>
        <StavRyderMatchTotal tournament={props.tournament} matches={props.matches}/>
        <StavRyderMatchDetail tournament={props.tournament} matches={props.matches}/>
      </>
    )
  }


}

const History = () => {

  //load data
  const authEmail = useAuth();
  const matches = useMatches();
  const tournaments = useTournaments();

  //if not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  if(!tournaments || !matches) {
    return ("Loading...")
  }

  //if there is no non-active tournament, just show basic info
  if (tournaments.filter(tournament => tournament.active === "0").length === 0) {
    return (
      <>
        <Alert variant="primary" className="v-100">
          <Alert.Heading>Zatím zde nic není</Alert.Heading>
          <p>V databázi zatím není žádný odehraný turnaj.</p>
        </Alert>
      </>
    )
  }

  //TODO - zobrazování výsledků turnaje podle systému turnaje

  return (
    <>
      <Accordion>
        {tournaments.filter(tournament => tournament.active === "0").map((tournament, index) => {
          return (
            <>
              <Accordion.Item eventKey={index} key={index} >
                <Accordion.Header>{tournament.id}</Accordion.Header>
                <Accordion.Body>
                  <HistoryOneTournament tournament={tournament} matches={matches}/>
                </Accordion.Body>
              </Accordion.Item>
            </>

          )
        })}

      </Accordion>
    </>

  )
}

export default History