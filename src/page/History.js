import React from 'react';
import { Navigate } from "react-router-dom";
import { Accordion, Alert } from "react-bootstrap";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { StavStblJednotlivci, StavStblTymy } from "./StavStableford.js"

const History = () => {

  //load data
  const authEmail = useAuth();
  const tournaments = useTournaments();

  //if not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  if(!tournaments) {
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
                  <StavStblJednotlivci tournamentId={tournament.id}/>
                  <StavStblTymy tournamentId={tournament.id}/>
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