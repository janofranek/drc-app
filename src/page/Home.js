import React, {useState, useEffect} from 'react';
import { Navigate  } from "react-router-dom";
import { db } from '../cred/firebase';
import { doc, onSnapshot } from "firebase/firestore";
import { Table, ButtonGroup, ToggleButton, Alert } from "react-bootstrap";
import "./Common.css"
import { useUsers } from '../data/UsersDataProvider';
import { useCourses } from '../data/CoursesDataProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { useAuth } from '../data/AuthProvider';
import { setHoleScore } from "./Utils.js"

const InfoPlayer = (props) => {
  return (
    <>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>Hráč</th>
            <th>H</th>
            <th>Tee</th>
            <th>P</th>
            <th>Datum</th>
            <th>Skóre</th>
            <th>Stbl</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{props.scorecard.player}</td>
            <td>{props.currentData.currentUser.hcp}</td>
            <td>{(props.scorecard.tee==="yellow" ? <span className="yellowdot"></span> : <span className="whitedot"></span>)}</td>
            <td>{props.scorecard.playingHCP}</td>
            <td>{props.currentData.currentRound.date}</td>
            <td className="thick">{props.scorecard.holes.reduce((a,v) =>  a = a + v.score , 0  )}</td>
            <td className="thick">{props.scorecard.holes.reduce((a,v) =>  a = a + v.stableford , 0  )}</td>
          </tr>
        </tbody>
      </Table>
    </>
  )
}

const HoleNumbers = (props) => {
  return (
    <>
      <thead key={"hole_numbers_"+props.nine}><tr>
        <th className="centerrow" key={"hole_hash_"+props.nine}>#</th>
        {props.nineHoles.map((hole) => { return <th className="centerrow" key={"hole_nr_"+hole.hole}>{hole.hole}</th> })}
        <th className="centerrow" key={"hole_sum_"+props.nine}>&sum;</th>
      </tr></thead>
    </>
  )
}

const Dots = (props) => {
  if (props.shots===-1) {
    return(<span class="reddot"></span>)
  } else if (props.shots===0) {
    return(<></>)
  } else {
    return (
      <>
        {Array.from({ length: props.shots }).map((value, index) => { return <span className="dot" key={"dot_"+index}></span> })}
      </>
    )
  }
}

const HoleSkore = (props) => {
  const [formData, setFormData] = useState({});

  function handleBlur(e) {
    e.preventDefault();
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    console.log("Blur")
    console.log(formData)
    setHoleScore(props.scorecardId, e.target.id, e.target.value)
  }

  function handleChange(e) {
    e.preventDefault();
    let newValue = e.target.value;
    if (newValue.trim() === "") { newValue = "0" }
    setFormData({
      ...formData,
      [e.target.id]: newValue,
    });
    console.log("Change")
    console.log(formData)
  }

  const handleKeyPress = (e) => {
    const charCode = e.charCode;
    const inputChar = String.fromCharCode(charCode);

    // Check if the input character would result in an invalid value
    if (!/^\d{1,3}$/.test(e.target.value + inputChar)) {
      e.preventDefault();
    }
  };

  return (
    <>
      <tr>
        <td className="leftrow">Par</td>
        {props.nineHoles.map((hole) => { return <td className="parrow" key={"hole_par_"+hole.hole}>{hole.par}<br/><Dots shots={hole.shots} /></td> })}
        <td className="centerrow"></td>
      </tr>
      <tr>
        <td className="leftrow">Skóre</td>
        {props.nineHoles.map((hole) => { 
          return <td className="centerrow" key={"hole_score_"+hole.hole}>
            <input type="text" 
              id={hole.hole}
              key={"hole_input_"+hole.hole}
              pattern="\d{1,2}"
              size="2"
              maxLength="2" 
              className="scoreinput" 
              value={formData[hole.hole] ?? hole.score}
              required
              onBlur={handleBlur}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
            /></td> 
          })}
        <th className="centerrow">{props.nineHoles.reduce((a,v) =>  a = a + v.score , 0  )}</th>
      </tr>
      <tr>
        <td className="leftrow">Stbl</td>
        {props.nineHoles.map((hole) => { return <td className="centerrow" key={"hole_stbl_"+hole.hole}>{hole.stableford}</td> })}
        <th className="centerrow">{props.nineHoles.reduce((a,v) =>  a = a + v.stableford , 0  )}</th>
      </tr>
    </>
  )
}

const ScorecardNine = (props) => {
  const nineHoles = props.scorecard.holes.slice((props.nine===1 ? 0 : 9), (props.nine===1 ? 9 : 18))
  return (
    <>
      <HoleNumbers nine={props.nine} nineHoles={nineHoles}/>
      <tbody>
        <HoleSkore nine={props.nine} nineHoles={nineHoles} scorecardId={props.scorecard.id}/>
      </tbody>
    </>
  )
}

const ScorecardPlayer = (props) => {

  return (
    <>
      <table className="scoretable">
      <colgroup>
        <col style={{width: "50px"}} />
        <col span = "10" style={{width: "31px"}} />
      </colgroup>
        <ScorecardNine nine={1} scorecard={props.scorecard}/>
        <ScorecardNine nine={2} scorecard={props.scorecard}/>
      </table>
    </>
  )
}

const SkorePlayer = (props) => {

  const [scorecard, setScorecard] = useState(null);
  const [errorMsg, seterrorMsg] = useState(null);

  useEffect(()=>{
    const scorecardId = props.currentData.currentRound.date + " " + props.currentData.currentUser.id
    const unsub = onSnapshot(doc(db, 'scorecards',scorecardId),
      (snapshot) => {
        setScorecard({...snapshot.data(), id:snapshot.id});
        seterrorMsg(null)
      },
      (error) => {
        seterrorMsg("Skórka ID " + scorecardId + " neexistuje")
        console.log("Skórka ID " + scorecardId + " neexistuje")
      });
    return () => { 
      unsub();
      setScorecard(null) 
    };
  }, [props.currentData.currentRound.date, props.currentData.currentUser.id])

  if(errorMsg) {
    return (<Alert variant="danger" className="v-100"><p>{errorMsg}</p></Alert>)
  }

  if(!scorecard) {
    return ("Loading...")
  }

  return (
    <>
      <InfoPlayer scorecard={scorecard} currentData={props.currentData}/>
      <ScorecardPlayer scorecard={scorecard} setScorecard={setScorecard}/>
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