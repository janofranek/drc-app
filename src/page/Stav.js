import React, {useState} from 'react';
import { Navigate  } from "react-router-dom";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { StavStblJednotlivci, StavStblTymy } from "./StavStableford.js"
import NoActiveTournament from "./NoActiveTournament"

const Stav = () => {

  const [radioValue, setRadioValue] = useState('1');

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

  const tournamentId = tournaments.filter(tournament => tournament.active === "1")[0].id

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
        ? <StavStblJednotlivci tournamentId={tournamentId}/> 
        : <StavStblTymy tournamentId={tournamentId}/>)}

    </div>
  )
}
 
export default Stav