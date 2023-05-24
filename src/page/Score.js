import React, {useState} from 'react';
import { Navigate  } from "react-router-dom";
import { Accordion, ButtonGroup, ToggleButton } from "react-bootstrap";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import { useUsers } from '../data/UsersDataProvider';
import { useCourses } from '../data/CoursesDataProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { InfoPlayer, ScorecardPlayer } from "./ScorecardPlayer.js"
import { SkoreFlightTable, SkoreFlightAccHeader, SkoreFlightAccBody } from "./ScorecardFlight.js"
import NoActiveTournament from "./NoActiveTournament"
import { getScorecardId, getFlight } from "./Utils.js"

const SkorePlayer = (props) => {

  return (
    <>
      <InfoPlayer scorecardId={props.scorecardId}/>
      <ScorecardPlayer scorecardId={props.scorecardId}/>
    </>
  )
}

const SkoreFlight = (props) => {

  const currentFlight = getFlight(props.currentUser, props.currentRound)

  return (
    <>
      <SkoreFlightTable currentFlight={currentFlight} currentRound={props.currentRound}/>
      <Accordion>
        {currentFlight.map((player, index) => { 
          return(
            <>
              <Accordion.Item eventKey={index} key={index} >
                <SkoreFlightAccHeader player={player} currentRound={props.currentRound}/>
                <SkoreFlightAccBody player={player} currentRound={props.currentRound}/> 
              </Accordion.Item>
            </>
          )
        })}
      </Accordion>
    </>
  )
  }
  
const Score = () => {
  const [radioValue, setRadioValue] = useState('1');

  //load data
  const authEmail = useAuth();
  const users = useUsers();
  const courses = useCourses();
  const tournaments = useTournaments();

  //if not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  //while data not loaded, show Loading...
  if (!users || !courses || !tournaments) return "Loading..."
  
  const radios = [
    { name: 'Jen já', value: '1' },
    { name: 'Celý flight', value: '2' }
  ];

  const currentUser = users.filter(user => user.email.toLowerCase() === authEmail.toLowerCase())[0]

  //if there is no active tournament or round, just show basic info
  if (tournaments.filter(tournament => tournament.active === "1").length === 0) {
    return <NoActiveTournament />
  }
  if (tournaments.filter(tournament => tournament.active === "1")[0].rounds.filter(round => round.active === "1").length === 0) {
    return <NoActiveTournament />
  }

  const currentRound = tournaments.filter(tournament => tournament.active === "1")[0].rounds.filter(round => round.active === "1")[0]
  const scorecardId = getScorecardId(currentRound.date, currentUser.id)

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

      {(radioValue==="1" ? <SkorePlayer scorecardId={scorecardId}/> : <SkoreFlight currentUser={currentUser} currentRound={currentRound}/>)}
    </div>
  )
}

export default Score