import React, { useState } from 'react';
import { Navigate } from "react-router-dom";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import "../components/Common.css"
import { useAuth } from '../data/AuthProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { StablefordStandingsIndividuals, StablefordStandingsTeams } from "../components/StandingsStableford.js"
import NoActiveTournament from "../components/NoActiveTournament"
import RyderMatchStandings from "../components/StandingsRyderMatch"

const StandingsTournamentUnknown = (props) => {
  return (
    <>
      <p>Nepodporovaný systém turnaje - {props.tournamentId} - {props.tournamentSystem}</p>
    </>
  )
}

const StandingsTournamentStableford = (props) => {
  const [radioValue, setRadioValue] = useState('1');

  const radios = [
    { name: 'Jednotlivci', value: '1' },
    { name: 'Týmy', value: '2' }
  ];

  return (
    <div>
      <ButtonGroup>
        {radios.map((radio, idx) => (
          <ToggleButton
            key={idx}
            id={`radio-${idx}`}
            type="radio"
            variant="outline-primary"
            size="sm"
            name="radio"
            value={radio.value}
            checked={radioValue === radio.value}
            onChange={(e) => setRadioValue(e.currentTarget.value)}
          >
            {radio.name}
          </ToggleButton>
        ))}
      </ButtonGroup>

      {(radioValue === "1"
        ? <StablefordStandingsIndividuals tournamentId={props.tournamentId} />
        : <StablefordStandingsTeams tournamentId={props.tournamentId} />)}

    </div>
  )
}

const Standings = () => {

  //load data
  const authEmail = useAuth();
  const tournaments = useTournaments();

  // If not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  if (!tournaments) {
    return ("Loading...")
  }

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

  if (tournamentSystem === "stableford") {
    return (<StandingsTournamentStableford tournamentId={tournamentId} />)
  } else if (tournamentSystem === "rydercup") {
    return (<RyderMatchStandings tournament={currTournament} />)
  } else {
    return (<StandingsTournamentUnknown tournamentId={tournamentId} tournamentSystem={tournamentSystem} />)
  }


}

export default Standings