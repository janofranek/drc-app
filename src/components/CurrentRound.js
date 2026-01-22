import React from 'react';
import { Accordion } from "react-bootstrap";
import { useTournaments } from '../data/TournamentsDataProvider';
import { ScoreFlightAccHeader, ScoreFlightAccBody } from "./ScorecardFlight.js";
import NoActiveTournament from "./NoActiveTournament";

const CurrentRoundTournamentUnknown = (props) => {
  return (
    <>
      <p>Nepodporovaný systém turnaje - {props.tournamentId} - {props.tournamentSystem}</p>
    </>
  )
}

const CurrentRoundTournamentRyderCup = (props) => {
  return (
    <>
      <p>Nothing to do here - Ryder Cup - {props.tournamentId}</p>
    </>
  )
}

const CurrentRoundTournamentStableford = (props) => {

  return (
    <>
      <Accordion>
        {props.currTournament.players.map((player, index) => {
          return (
            <Accordion.Item eventKey={index} key={index} >
              <ScoreFlightAccHeader player={player} currentRound={props.currRound} />
              <ScoreFlightAccBody player={player} currentRound={props.currRound} />
            </Accordion.Item>
          )
        })}
      </Accordion>
    </>
  )
}

const CurrentRound = () => {

  //load data
  const tournaments = useTournaments();

  //while data not loaded, show Loading...
  if (!tournaments) return "Loading ... CurrentRound"

  //if there is no active tournament or round, just show basic info
  if (tournaments.filter(tournament => tournament.active).length === 0) {
    return <NoActiveTournament />
  }
  if (tournaments.filter(tournament => tournament.active)[0].rounds.filter(round => round.active).length === 0) {
    return <NoActiveTournament />
  }

  const currTournament = tournaments.filter(tournament => tournament.active)[0];
  const tournamentSystem = currTournament.system;
  const tournamentId = currTournament.id;
  const currRound = currTournament.rounds.filter(round => round.active)[0];

  if (tournamentSystem === "stableford") {
    return (<CurrentRoundTournamentStableford currTournament={currTournament} currRound={currRound} />)
  } else if (tournamentSystem === "rydercup") {
    return (<CurrentRoundTournamentRyderCup tournamentId={tournamentId} />)
  } else {
    return (<CurrentRoundTournamentUnknown tournamentId={tournamentId} tournamentSystem={tournamentSystem} />)
  }
}

export default CurrentRound;
