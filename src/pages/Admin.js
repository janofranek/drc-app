import React, { useState } from 'react';
import { Navigate } from "react-router-dom";
import { Table, Button, Container, Tabs, Tab, Form, Accordion } from "react-bootstrap";
import "../components/Common.css"
import { useUsers } from '../data/UsersDataProvider';
import { useAuth } from '../data/AuthProvider';
import { useCourses } from '../data/CoursesDataProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { ScoreFlightAccHeader, ScoreFlightAccBody } from "../components/ScorecardFlight.js";
import { getScorecardId, createNewScorecard, resetScorecard } from "../utils/Utils.js";
import NoActiveTournament from "../components/NoActiveTournament";


const UsersTable = () => {
  const users = useUsers();

  if (!users) return "Loading..."

  return (
    <>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Jméno</th>
            <th>E-mail</th>
            <th>HCP</th>
          </tr>
        </thead>
        <tbody>
          {users.map((row, index) => {
            return <tr key={"users_row_" + index}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.hcp}</td>
            </tr>;
          })}
        </tbody>
      </Table>
    </>
  )
}
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
        <Button variant="primary" type="submit" onClick={onInitScorecards}>Init skorky</Button>
        <Button variant="primary" type="submit" onClick={onResetScorecards}>Reset skorky</Button>
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
            defaultvalue="yellow"
            onChange={(e) => setTeeColor(e.target.value)}
          >
            <option value="yellow">Žlutá</option>
            <option value="white">Bílá</option>
          </Form.Select>
          <Button variant="primary" type="submit" onClick={onResetJednaSkorka}>Reset jedna skorka</Button>
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
  if (tournaments.filter(tournament => tournament.active === "1").length === 0) {
    return <NoActiveTournament />
  }
  if (tournaments.filter(tournament => tournament.active === "1")[0].rounds.filter(round => round.active === "1").length === 0) {
    return <NoActiveTournament />
  }

  const currTournament = tournaments.filter(tournament => tournament.active === "1")[0];
  const tournamentSystem = currTournament.system;
  const tournamentId = currTournament.id;
  const currRound = currTournament.rounds.filter(round => round.active === "1")[0];
  const currCourse = courses.filter(course => course.id === currRound.course)[0];


  if (tournamentSystem === "stableford") {
    return (<AdminScorecardsTournamentStableford currTournament={currTournament} currRound={currRound} currCourse={currCourse} />)
  } else if (tournamentSystem === "rydercup") {
    return (<AdminScorecardsTournamentRyderCup tournamentId={tournamentId} />)
  } else {
    return (<AdminScorecardsTournamentUnknown tournamentId={tournamentId} tournamentSystem={tournamentSystem} />)
  }
}

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
            <>
              <Accordion.Item eventKey={index} key={index} >
                <ScoreFlightAccHeader player={player} currentRound={props.currRound} />
                <ScoreFlightAccBody player={player} currentRound={props.currRound} />
              </Accordion.Item>
            </>
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
  if (tournaments.filter(tournament => tournament.active === "1").length === 0) {
    return <NoActiveTournament />
  }
  if (tournaments.filter(tournament => tournament.active === "1")[0].rounds.filter(round => round.active === "1").length === 0) {
    return <NoActiveTournament />
  }

  const currTournament = tournaments.filter(tournament => tournament.active === "1")[0];
  const tournamentSystem = currTournament.system;
  const tournamentId = currTournament.id;
  const currRound = currTournament.rounds.filter(round => round.active === "1")[0];

  if (tournamentSystem === "stableford") {
    return (<CurrentRoundTournamentStableford currTournament={currTournament} currRound={currRound} />)
  } else if (tournamentSystem === "rydercup") {
    return (<CurrentRoundTournamentRyderCup tournamentId={tournamentId} />)
  } else {
    return (<CurrentRoundTournamentUnknown tournamentId={tournamentId} tournamentSystem={tournamentSystem} />)
  }
}

const Admin = () => {

  //load data
  const authEmail = useAuth();

  // If not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Container fluid>
        <Tabs fill>
          <Tab eventKey="users" title="users">
            <UsersTable />
          </Tab>
          <Tab eventKey="adminScorecards" title="adminScorecards">
            <AdminScorecards />
          </Tab>
          <Tab eventKey="currentRound" title="currentRound">
            <CurrentRound />
          </Tab>
        </Tabs>
      </Container>
    </div>
  )
}

export default Admin