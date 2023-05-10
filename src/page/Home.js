import React, {useState, useEffect} from 'react';
import { Navigate  } from "react-router-dom";
import { db } from '../cred/firebase';
import { Table, ButtonGroup, ToggleButton } from "react-bootstrap";
import "./Common.css"
import { getPlayingHCP, checkScorecardExists } from "./Utils.js"
import { useUsers } from '../data/UsersDataProvider';
import { useCourses } from '../data/CoursesDataProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { useAuth } from '../data/AuthProvider';

const InfoPlayer = (props) => {
  return (
    <>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>Hráč</th>
            <th>H</th>
            <th>P</th>
            <th>Datum</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{props.currentData.currentUser.name}</td>
            <td>{props.currentData.currentUser.hcp}</td>
            <td>{getPlayingHCP(props.currentData.currentUser, props.currentData.currentCourse, "yellow")}</td>
            <td>{props.currentData.currentRound.date}</td>
          </tr>
        </tbody>
      </Table>
    </>
  )

}

const HoleNumbers = (props) => {
  return (
    <>
      <thead><tr>
        {Array.from({ length: 18 }).map((value, index) => { return <th>{index+1}</th> })}
      </tr></thead>
    </>
  )

}

const ScorecardPlayer = (props) => {
  return (
    <>
      <Table bordered size="sm">
        <HoleNumbers currentCourse={props.currentData.currentCourse}/>
      </Table>
    </>
  )

}

const SkorePlayer = (props) => {

  useEffect(()=>{
    checkScorecardExists(db, props.currentData.currentUser.id, props.currentData.currentRound.date, props.currentData.currentCourse.id, "yellow");
  }, [props])

  return (
    <>
      <InfoPlayer currentData={props.currentData} />
      <ScorecardPlayer currentData={props.currentData} />
    </>
  )
}

const SkoreFlight = (props) => {
  return (
    <p>
      Celý flight
    </p> 


    )
  }
  
const Home = () => {
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

  const getCurrentUser = () => {
    if (!authEmail || !users ) {
        return { "name": "???", "hcp": "???"}
    } else {
        return users.filter(user => user.email.toLowerCase() === authEmail.toLowerCase())[0]
    }
  }

  const getCurrentRound = () => {
    if (!authEmail || !tournaments) {
        return { "course": "???", "date": "???"}
    } else {
      let currTournament = tournaments.filter(tournament => tournament.active === "1")[0]
      let currRound = currTournament.rounds.filter(round => round.active === "1")[0]
      return { ...currRound, "teams": currTournament.teams }
    }
  }

  const getCurrentCourse = () => {
    if (!authEmail || !courses) {
        return { "id": "???"}
    } else {
      return courses.filter(course => course.id === getCurrentRound().course)[0]
    }
  }

  const currentData = { "currentUser": getCurrentUser(),
    "currentRound": getCurrentRound(), 
    "currentCourse": getCurrentCourse() }

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

      {(radioValue==="1" ? <SkorePlayer currentData={currentData}/> : <SkoreFlight currentData={currentData}/>)}
    </div>
  )
}

export default Home