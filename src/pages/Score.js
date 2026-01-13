import React, { useState } from 'react';
import { Navigate } from "react-router-dom";
import { Accordion, ButtonGroup, ToggleButton } from "react-bootstrap";
import "../components/Common.css"
import { useAuth } from '../data/AuthProvider';
import { useUsers } from '../data/UsersDataProvider';
import { useCourses } from '../data/CoursesDataProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { InfoPlayer, ScorecardPlayer } from "../components/ScorecardPlayer.js"
import { ScoreFlightTable, ScoreFlightAccHeader, ScoreFlightAccBody } from "../components/ScorecardFlight.js"
import { ScorecardRyderMatch } from "../components/ScorecardRyderMatch.js"
import NoActiveTournament from "../components/NoActiveTournament"
import { getScorecardId, getFlight } from "../utils/Utils.js"

const ScorePlayer = (props) => {

  return (
    <>
      <InfoPlayer scorecardId={props.scorecardId} />
      <ScorecardPlayer scorecardId={props.scorecardId} />
    </>
  )
}

const ScoreFlight = (props) => {

  const currentFlight = getFlight(props.currentUser, props.currentRound)

  return (
    <>
      <ScoreFlightTable currentFlight={currentFlight} currentRound={props.currentRound} />
      <Accordion>
        {currentFlight.map((player, index) => {
          return (
            <>
              <Accordion.Item eventKey={index} key={index} >
                <ScoreFlightAccHeader player={player} currentRound={props.currentRound} />
                <ScoreFlightAccBody player={player} currentRound={props.currentRound} />
              </Accordion.Item>
            </>
          )
        })}
      </Accordion>
    </>
  )
}

const ScoreTournamentUnknown = (props) => {
  return (
    <>
      <p>Nepodporovaný systém turnaje - {props.tournamentId} - {props.tournamentSystem}</p>
    </>
  )
}

const ScoreTournamentRyderCup = (props) => {

  return (
    <>
      <ScorecardRyderMatch currTournament={props.currTournament} currentRound={props.currentRound} currentUser={props.currentUser} />
    </>
  )
}

const ScoreTournamentStableford = (props) => {
  const [radioValue, setRadioValue] = useState('1');

  const radios = [
    { name: 'Jen já', value: '1' },
    { name: 'Celý flight', value: '2' }
  ];

  const scorecardId = getScorecardId(props.currentRound.date, props.currentUser.id)

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

      {(radioValue === "1" ? <ScorePlayer scorecardId={scorecardId} /> : <ScoreFlight currentUser={props.currentUser} currentRound={props.currentRound} />)}
    </div>
  )

}

const Score = () => {

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
  if (!users) return "Loading...users"
  if (!courses) return "Loading...courses"
  if (!tournaments) return "Loading...tournaments"
  //if (!users || !courses || !tournaments) return "Loading..."

  const currentUser = users.filter(user => user.email.toLowerCase() === authEmail.toLowerCase())[0]

  //if there is no active tournament or round, just show basic info
  if (tournaments.filter(tournament => tournament.active === "1").length === 0) {
    return <NoActiveTournament />
  }
  if (tournaments.filter(tournament => tournament.active === "1")[0].rounds.filter(round => round.active === "1").length === 0) {
    return <NoActiveTournament />
  }

  const currTournament = tournaments.filter(tournament => tournament.active === "1")[0]
  const tournamentSystem = currTournament.system;
  const tournamentId = currTournament.id;
  const currentRound = currTournament.rounds.filter(round => round.active === "1")[0]

  if (tournamentSystem === "stableford") {
    return (<ScoreTournamentStableford
      tournamentId={tournamentId}
      currentRound={currentRound}
      currentUser={currentUser}
    />)
  } else if (tournamentSystem === "rydercup") {
    return (<ScoreTournamentRyderCup
      currTournament={currTournament}
      currentRound={currentRound}
      currentUser={currentUser}
      readOnly={false}
    />)
  } else {
    return (<ScoreTournamentUnknown
      tournamentId={tournamentId}
      tournamentSystem={tournamentSystem}
    />)
  }
}

export default Score