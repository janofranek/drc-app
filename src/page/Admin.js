import React, {useState} from 'react';
import { Navigate  } from "react-router-dom";
import { Table, Button, Container, Tabs, Tab, Form, Accordion } from "react-bootstrap";
import "./Common.css"
import { useUsers } from '../data/UsersDataProvider';
import { useAuth } from '../data/AuthProvider';
import { useCourses } from '../data/CoursesDataProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { SkoreFlightAccHeader, SkoreFlightAccBody } from "./ScorecardFlight.js"
import { getScorecardId, createNewScorecard, resetScorecard } from "./Utils.js"
import NoActiveTournament from "./NoActiveTournament"


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
          <th>Zkratka</th>
          <th>E-mail</th>
          <th>HCP</th>
        </tr>
      </thead>
      <tbody>
        {users.map((row, index) => {
          return <tr key={"users_row_" + index}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.short}</td>
              <td>{row.email}</td>
              <td>{row.hcp}</td>
            </tr>;
          })}
      </tbody>
      </Table>
    </>
  )
}
const AdminSkorkyTournamentUnknown = (props) => {
  return (
    <>
      <p>Nepodporovaný systém turnaje - {props.tournamentId} - {props.tournamentSystem}</p>
    </>
  )
}

const AdminSkorkyTournamentRyderCup = (props) => {
  return (
    <>
      <p>TODO - AktualKolo Ryder Cup - {props.tournamentId}</p>
    </>
  )
}

const AdminSkorkyTournamentStableford = (props) => {
  const [scorecardId, setScorecardId] = useState('');
  const [teeColor, setTeeColor] = useState('yellow');

  const users = useUsers();

  const onInitSkorky = async (e) => {
    e.preventDefault();

    //loop over players
    props.currTournament.players.forEach(async playerId => {
      const initScorecardId = getScorecardId( props.currRound.date, playerId );
      const playerUser = users.filter(user => user.id === playerId)[0];
      await createNewScorecard(initScorecardId, playerUser, props.currCourse)
    });
  }

  const onResetSkorky = async (e) => {
    e.preventDefault();

    //loop over players
    props.currTournament.players.forEach(async playerId => {
      const resetScorecardId = getScorecardId( props.currRound.date, playerId );
      const playerUser = users.filter(user => user.id === playerId)[0];
      await resetScorecard(resetScorecardId, playerUser, props.currCourse)
    });
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
        <Button variant="primary" type="submit" onClick={onInitSkorky}>Init skorky</Button>
        <Button variant="primary" type="submit" onClick={onResetSkorky}>Reset skorky</Button>
        <Form.Group className="mb-3">
          <Form.Label>ScorecardId</Form.Label>
          <Form.Control 
            className="form-control"
            type="text" 
            placeholder="ScorecardId" 
            id="scorecardid"
            name="scorecardid" 
            required 
            onChange={(e)=>setScorecardId(e.target.value)}/>
          <Form.Label>Tee</Form.Label>
          <Form.Select
            type="text" 
            id="teeColor"
            name="teeColor" 
            required 
            defaultvalue="yellow"
            onChange={(e)=>setTeeColor(e.target.value)}
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

const AdminSkorky = () => {

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
    return(<AdminSkorkyTournamentStableford currTournament={currTournament} currRound={currRound} currCourse={currCourse} />)
  } else if (tournamentSystem === "rydercup") {
    return(<AdminSkorkyTournamentRyderCup tournamentId={tournamentId} />)
  } else {
    return(<AdminSkorkyTournamentUnknown tournamentId={tournamentId} tournamentSystem={tournamentSystem} />)
  }
}

const AktualKoloTournamentUnknown = (props) => {
  return (
    <>
      <p>Nepodporovaný systém turnaje - {props.tournamentId} - {props.tournamentSystem}</p>
    </>
  )
}

const AktualKoloTournamentRyderCup = (props) => {
  return (
    <>
      <p>TODO - AktualKolo Ryder Cup - {props.tournamentId}</p>
    </>
  )
}

const AktualKoloTournamentStableford = (props) => {
  return (
    <>
      <Accordion>
        {props.currTournament.players.map((player, index) => { 
          return(
            <>
              <Accordion.Item eventKey={index} key={index} >
                <SkoreFlightAccHeader player={player} currentRound={props.currRound}/>
                <SkoreFlightAccBody player={player} currentRound={props.currRound}/> 
              </Accordion.Item>
            </>
          )
        })}
      </Accordion>
    </>
  )
}

const AktualKolo = () => {

  //load data
  const tournaments = useTournaments();

  //while data not loaded, show Loading...
  if (!tournaments) return "Loading..."

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
    return(<AktualKoloTournamentStableford currTournament={currTournament} currRound={currRound} />)
  } else if (tournamentSystem === "rydercup") {
    return(<AktualKoloTournamentRyderCup tournamentId={tournamentId} />)
  } else {
    return(<AktualKoloTournamentUnknown tournamentId={tournamentId} tournamentSystem={tournamentSystem} />)
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
          <Tab eventKey="adminSkorky" title="adminSkorky">
            <AdminSkorky />
          </Tab>
          <Tab eventKey="aktualKolo" title="aktualKolo">
            <AktualKolo />
          </Tab>
        </Tabs>
      </Container>
    </div>
  )
}
 
export default Admin