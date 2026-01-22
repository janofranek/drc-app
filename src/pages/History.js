import React from 'react';
import { Navigate } from "react-router-dom";
import { Accordion, Alert } from "react-bootstrap";
import "../components/Common.css"
import { useAuth } from '../data/AuthProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { useMatches } from "../data/MatchesDataProvider"
import { StablefordStandingsIndividuals, StablefordStandingsTeams } from "../components/StandingsStableford"
import { RyderMatchStandingsTotal, RyderMatchStandingsDetail } from "../components/StandingsRyderMatch"

const HistoryOneTournament = (props) => {

  if (props.tournament.system === "stableford") {
    return (
      <>
        <StablefordStandingsIndividuals tournamentId={props.tournament.id} />
        <StablefordStandingsTeams tournamentId={props.tournament.id} />
      </>
    )
  } else if (props.tournament.system === "rydercup") {
    return (
      <>
        <RyderMatchStandingsTotal tournament={props.tournament} matches={props.matches} />
        <RyderMatchStandingsDetail tournament={props.tournament} matches={props.matches} />
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

  if (!tournaments || !matches) {
    return ("Loading...")
  }

  const archivedTournaments = tournaments
    .filter(t => !t.status || t.status === 'archive')
    .sort((a, b) => b.datestart.localeCompare(a.datestart));

  if (archivedTournaments.length === 0) {
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
        {archivedTournaments.map((tournament, index) => {
          const dateStr = `${tournament.datestart.split('-').reverse().join('.')} - ${tournament.dateend.split('-').reverse().join('.')}`;
          return (
            <Accordion.Item eventKey={index} key={tournament.id} >
              <Accordion.Header>{tournament.info} ({dateStr})</Accordion.Header>
              <Accordion.Body>
                <HistoryOneTournament tournament={tournament} matches={matches} />
              </Accordion.Body>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </>
  )
}

export default History