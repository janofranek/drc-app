import React from 'react';
import { Navigate  } from "react-router-dom";
import { db } from '../cred/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Table, Button, Container, Tabs, Tab } from "react-bootstrap";
import "./Common.css"
import { useUsers } from '../data/UsersDataProvider';
import { useAuth } from '../data/AuthProvider';
import { useCourses } from '../data/CoursesDataProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { getPlayingHCP, getHoleShots } from "./Utils.js"


const UsersTable = () => {
  const users = useUsers();

  if (!users) return "Loading..."

  return (
    <>
      <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
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


const Admin = () => {

  //load data
  const authEmail = useAuth();
  const users = useUsers();
  const courses = useCourses();
  const tournaments = useTournaments();

  // If not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  //while data not loaded, show Loading...
  if (!users || !courses || !tournaments) return "Loading..."

  const onInitSkorky = async (e) => {
    e.preventDefault();

    const currTournament = tournaments.filter(tournament => tournament.active === "1")[0];
    const currRound = currTournament.rounds.filter(round => round.active === "1")[0];
    const currCourse = courses.filter(course => course.id === currRound.course)[0];

    //loop over players
    currTournament.players.forEach(async player => {
      const scorecardId = currRound.date + " " + player;
      const docSnap = await getDoc(doc(db,'scorecards',scorecardId));
      //insert only if the scorecard does not already exist
      if (!docSnap.exists()) {
        const playerUser = users.filter(user => user.id === player)[0];
        const playingHCP = getPlayingHCP(playerUser, currCourse);
        const newScorecard = { "course": currCourse.id,
            "player": player,
            "tee": playerUser.tee,
            "playingHCP": playingHCP,
            "holes": [] }
        currCourse.holes.forEach(hole => {
          newScorecard.holes.push(
            {
              "hole": hole.hole,
              "par": hole.par,
              "shots": getHoleShots( hole.index, playingHCP ),
              "score": 0,
              "stableford": 0
            }
          )
        })
        await setDoc(doc(db,'scorecards',scorecardId), newScorecard);
      }
      
    });
    
  }


  return (
    <div>
      <Container fluid>
        <Tabs fill>
          <Tab eventKey="users" title="users">
            <UsersTable />
          </Tab>
          <Tab eventKey="initSkorky" title="initSkorky">
            <Button variant="primary" type="submit" onClick={onInitSkorky}>Init skorky</Button>
          </Tab>
        </Tabs>
      </Container>
    </div>
  )
}
 
export default Admin