import React, {useState} from 'react';
import { Navigate  } from "react-router-dom";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { StavStblJednotlivci, StavStblTymy } from "./StavStableford.js"
import NoActiveTournament from "./NoActiveTournament"
import StavRyderMatch from "./StavRyderMatch"

const StavTournamentUnknown = (props) => {
  return (
    <>
      <p>Nepodporovaný systém turnaje - {props.tournamentId} - {props.tournamentSystem}</p>
    </>
  )
}

const StavTournamentStableford = (props) => {
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

      {(radioValue==="1" 
        ? <StavStblJednotlivci tournamentId={props.tournamentId}/> 
        : <StavStblTymy tournamentId={props.tournamentId}/>)}

    </div>
  )
}

const Stav = () => {

  //load data
  const authEmail = useAuth();
  const tournaments = useTournaments();

  // If not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  if(!tournaments) {
    return ("Loading...")
  }

  //if there is no active tournament or round, just show basic info
  if (tournaments.filter(tournament => tournament.active === "1").length === 0) {
    return <NoActiveTournament />
  }
  if (tournaments.filter(tournament => tournament.active === "1")[0].rounds.filter(round => round.active === "1").length === 0) {
    return <NoActiveTournament />
  }

  const currTournament = tournaments.filter(tournament => tournament.active === "1")[0];
  const tournamentSystem = currTournament.system;
  const tournamentId = currTournament.id;

  if (tournamentSystem === "stableford") {
    return(<StavTournamentStableford tournamentId={tournamentId} />)
  } else if (tournamentSystem === "rydercup") {
    return(<StavRyderMatch tournament={currTournament} />)
  } else {
    return(<StavTournamentUnknown tournamentId={tournamentId} tournamentSystem={tournamentSystem} />)
  }

  
}
 
export default Stav