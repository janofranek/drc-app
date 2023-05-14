import React, {useState, useEffect} from 'react';
import { Navigate  } from "react-router-dom";
import { db } from '../cred/firebase';
import { collection, onSnapshot } from "firebase/firestore";
import { Table, ButtonGroup, ToggleButton, Alert } from "react-bootstrap";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import { useUsers } from '../data/UsersDataProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { getRoundSkore } from "./Utils.js"

const ResultsTableHeaders = (props) => {
  return (
    <>
      <thead>
        <tr key="RHT">
          <th key="A" rowSpan="2">#</th>
          <th key="B" rowSpan="2">Hráč</th>
          {props.currTournament.rounds.map((round, index) => {
            return(<th colSpan="2" key={round.date}>Kolo: {index+1}</th>)
          })}
          <th key="C" colSpan="2">Celkem</th>
        </tr>
        <tr key="RHB">
          {props.currTournament.rounds.map((round, index) => {
            return(<><th key={"R"+round.date}>Rány</th ><th key={"S"+round.date}>Stbl</th></>)
          })}
          <th key="R">Rány</th><th key="S">Stbl</th>
        </tr>
      </thead>
    </>
  )
}

const ResultsTableRow = (props) => {
  return (
    <>
      <tr key={props.counter}>
        <th key="DRI">{props.counter + 1}</th>
        <td key="DRP">{props.dataRow.player}</td>
        {props.currTournament.rounds.map((round, index) => {
            return(<><td key={"R"+round.date}>{props.dataRow[round.date+"_skore"]}</td>
                    <td key={"S"+round.date}>{props.dataRow[round.date+"_stbl"]}</td></>)
          })}
        <th key="DRTR">{props.dataRow.totalSkore}</th>
        <th key="DRTS">{props.dataRow.totalStbl}</th>
      </tr>
    </>
  )
}

const ResultsTableRows = (props) => {
  return (
    <>
      <tbody>
        {props.resultsTableData.map( (row, index) => {
          return ( <ResultsTableRow counter={index} dataRow={row} currTournament={props.currTournament}/> )
        })}
      </tbody>
    </>
  )
}


const StavJednotlivci = (props) => { 

  let resultsTableData = [];
  const currTournament = props.tournaments.filter(tournament => tournament.active === "1")[0];

  currTournament.players.forEach( (player) => {
    let rowData = { "player": player }
    let totalSkore = 0, totalStbl = 0
    currTournament.rounds.forEach( (round) => {
      const [roundSkore, roundStbl] = getRoundSkore( player, round.date, props.scorecards )
      rowData[round.date+"_skore"] = roundSkore
      rowData[round.date+"_stbl"] = roundStbl
      totalSkore = totalSkore + roundSkore
      totalStbl = totalStbl + roundStbl
    });
    rowData.totalSkore = totalSkore
    rowData.totalStbl = totalStbl
    resultsTableData.push(rowData);
  });

  resultsTableData.sort((a, b) => b.totalStbl - a.totalStbl)

  return (
    <>
      <Table striped bordered hover size="sm">
        <ResultsTableHeaders currTournament={currTournament}/>
        <ResultsTableRows currTournament={currTournament} resultsTableData={resultsTableData}/>
      </Table>
    </>
  )

}

const StavTymy = (props) => {

}


const Stav = () => {

  const [radioValue, setRadioValue] = useState('1');
  const [scorecards, setScorecards] = useState(null);
  const [errorMsg, seterrorMsg] = useState(null);

  //load data
  const authEmail = useAuth();
  const users = useUsers();
  const tournaments = useTournaments();

  //subscribe scorecards
  useEffect(()=>{
    const unsub = onSnapshot(collection(db, 'scorecards'),
      (snapshot) => {
        const newData = [];
        snapshot.forEach((doc) => {
          newData.push({...doc.data(), id:doc.id })
        });
        setScorecards(newData);
        seterrorMsg(null)
      },
      (error) => {
        seterrorMsg("Nepovedlo se načíst skórkarty")
        console.log("Nepovedlo se načíst skórkarty")
      });
    return () => { 
      unsub();
      setScorecards(null) 
    };
  }, [])

  // If not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
  }

  if(errorMsg) {
    return (<Alert variant="danger" className="v-100"><p>{errorMsg}</p></Alert>)
  }

  if(!scorecards || !users || !tournaments) {
    return ("Loading...")
  }

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
        ? <StavJednotlivci users={users} tournaments={tournaments} scorecards={scorecards}/> 
        : <StavTymy users={users} tournaments={tournaments} scorecards={scorecards}/>)}

    </div>
  )
}
 
export default Stav