import React, { useState } from 'react';
import { Button, Form } from "react-bootstrap";
import { useUsers } from '../data/UsersDataProvider';
import { useCourses } from '../data/CoursesDataProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { getScorecardId, createNewScorecard, resetScorecard } from "../utils/Utils.js";
import NoActiveTournament from "./NoActiveTournament";

const AdminScorecardsTournamentUnknown = (props) => {
  return (
    <>
      <p>Nepodporovaný systém turnaje - {props.tournamentId} - {props.tournamentSystem}</p>
    </>
  )
}

const AdminScorecardsTournamentRyderCup = (props) => {
  return (
    <>
      <p>Nothing to do here - Ryder Cup - {props.tournamentId}</p>
    </>
  )
}

const AdminScorecardsTournamentStableford = (props) => {
  const [scorecardId, setScorecardId] = useState('');
  const [teeColor, setTeeColor] = useState('yellow');

  const users = useUsers();

  const onInitScorecards = async (e) => {
    e.preventDefault();

    //loop over players
    await Promise.all(props.currTournament.players.map(async playerId => {
      const initScorecardId = getScorecardId(props.currRound.date, playerId);
      const playerUser = users.find(user => user.id === playerId);
      if (playerUser) {
        await createNewScorecard(initScorecardId, playerUser, props.currCourse)
      }
    }));
  }

  const onResetScorecards = async (e) => {
    e.preventDefault();

    //loop over players
    await Promise.all(props.currTournament.players.map(async playerId => {
      const resetScorecardId = getScorecardId(props.currRound.date, playerId);
      const playerUser = users.find(user => user.id === playerId);
      if (playerUser) {
        await resetScorecard(resetScorecardId, playerUser, props.currCourse)
      }
    }));
  }

  const onResetJednaSkorka = async (e) => {
    e.preventDefault();
    const playerId = scorecardId.substring(11)
    const playerUser = users.filter(user => user.id === playerId)[0];
    await resetScorecard(scorecardId, playerUser, props.currCourse, teeColor)
  }

  return (
    <>
      <Form className="form-signin">
        <div className="d-grid gap-2 mb-3">
          <Button variant="primary" type="submit" onClick={onInitScorecards}>Init Scorecards</Button>
          <Button variant="primary" type="submit" onClick={onResetScorecards}>Reset Scorecards</Button>
        </div>
        <Form.Group className="mb-3">
          <Form.Label>ScorecardId</Form.Label>
          <Form.Control
            className="form-control"
            type="text"
            placeholder="ScorecardId"
            id="scorecardid"
            name="scorecardid"
            required
            onChange={(e) => setScorecardId(e.target.value)} />
          <Form.Label>Tee</Form.Label>
          <Form.Select
            type="text"
            id="teeColor"
            name="teeColor"
            required
            defaultValue="yellow"
            onChange={(e) => setTeeColor(e.target.value)}
          >
            <option value="yellow">Žlutá</option>
            <option value="white">Bílá</option>
          </Form.Select>
          <div className="d-grid gap-2 mt-2">
            <Button variant="primary" type="submit" onClick={onResetJednaSkorka}>Reset one scorecard</Button>
          </div>
        </Form.Group>
      </Form>
    </>
  )
}

const AdminScorecards = () => {

  //load data
  const users = useUsers();
  const courses = useCourses();
  const tournaments = useTournaments();

  //while data not loaded, show Loading...
  if (!users || !courses || !tournaments) return "Loading..."

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
  const currCourse = courses.filter(course => course.id === currRound.course)[0];


  if (tournamentSystem === "stableford") {
    return (<AdminScorecardsTournamentStableford currTournament={currTournament} currRound={currRound} currCourse={currCourse} />)
  } else if (tournamentSystem === "rydercup") {
    return (<AdminScorecardsTournamentRyderCup tournamentId={tournamentId} />)
  } else {
    return (<AdminScorecardsTournamentUnknown tournamentId={tournamentId} tournamentSystem={tournamentSystem} />)
  }
}

export default AdminScorecards;
