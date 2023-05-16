import React, {useState} from 'react';
import { Navigate  } from "react-router-dom";
import { Table, ButtonGroup, ToggleButton } from "react-bootstrap";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import { useUsers } from '../data/UsersDataProvider';
import { useTournaments } from '../data/TournamentsDataProvider';
import { useScorecards } from '../data/ScorecardsDataProvider';
import { getRoundSkore, getTeamRoundSkore } from "./Utils.js"

const ResultsTableHeaders = (props) => {
  return (
    <>
      <thead>
        <tr key="RHT">
          <th key="A">#</th>
          <th key="B" className="leftrow">Hráč</th>
          {props.currTournament.rounds.map((round, index) => {
            return(<th key={round.date}>{index+1}. kolo</th>)
          })}
          <th key="C">Celkem</th>
        </tr>
      </thead>
    </>
  )
}

const TeamResultsTableHeaders = (props) => {
  return (
    <>
      <thead>
        <tr key="RHT">
          <th key="A">#</th>
          <th key="B" colspan="2" className="leftrow">Tým</th>
          {props.currTournament.rounds.map((round, index) => {
            return(<th key={round.date}>{index+1}. kolo</th>)
          })}
          <th key="C">Celkem</th>
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
        <td key="DRP" className="leftrow">{props.dataRow.player}</td>
        {props.currTournament.rounds.map((round, index) => {
            return(<><td key={"R"+round.date+props.counter}>
              {props.dataRow[round.date+"_skore"]} / {props.dataRow[round.date+"_stbl"]}
            </td></>)
          })}
        <th key="DRTR">{props.dataRow.totalSkore} / {props.dataRow.totalStbl}</th>
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

const getTeamMembers = (team) => {
  let members = team.players.toString();
  return members.replace(",", " / ").replace(",", " / ")
}

const TeamResultsTableRow = (props) => {
  return (
    <>
      <tr key={props.counter}>
        <th key="DRI">{props.counter + 1}</th>
        <td key="DRT" className="leftrow">{props.dataRow.team.name}</td>
        <td key="DRP" className="leftrow">{getTeamMembers(props.dataRow.team)}</td>
        {props.currTournament.rounds.map((round, index) => {
            return(<><td key={"R"+round.date+props.counter}>
              {props.dataRow[round.date+"_stbl"]}
            </td></>)
          })}
        <th key="DRTR">{props.dataRow.totalStbl}</th>
      </tr>
    </>
  )
}

const TeamResultsTableRows = (props) => {
  return (
    <>
      <tbody>
        {props.teamTableData.map( (row, index) => {
          return ( <TeamResultsTableRow counter={index} dataRow={row} currTournament={props.currTournament}/> )
        })}
      </tbody>
    </>
  )
}

const getResultsDataTable = (currTournament, scorecards) => {
  let resultsTableData = [];

  currTournament.players.forEach( (player) => {
    let rowData = { "player": player }
    let totalSkore = 0, totalStbl = 0
    currTournament.rounds.forEach( (round) => {
      const [roundSkore, roundStbl] = getRoundSkore( player, round.date, scorecards )
      rowData[round.date+"_skore"] = roundSkore
      rowData[round.date+"_stbl"] = roundStbl
      totalSkore = totalSkore + roundSkore
      totalStbl = totalStbl + roundStbl
    });
    rowData.totalSkore = totalSkore
    rowData.totalStbl = totalStbl
    resultsTableData.push(rowData);
  });

  return resultsTableData
}

const StavJednotlivci = (props) => { 
  const currTournament = props.tournaments.filter(tournament => tournament.active === "1")[0];
  let resultsTableData = getResultsDataTable(currTournament, props.scorecards);
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
  const currTournament = props.tournaments.filter(tournament => tournament.active === "1")[0];
  let resultsTableData = getResultsDataTable(currTournament, props.scorecards);
  let teamTableData = [];
  currTournament.teams.forEach(team => {
    let rowData = { "team": team }
    let totalStbl = 0
    currTournament.rounds.forEach( (round) => {
      const roundStbl = getTeamRoundSkore( team, round.date, resultsTableData )
      rowData[round.date+"_stbl"] = roundStbl
      totalStbl = totalStbl + roundStbl
    });
    rowData.totalStbl = totalStbl
    teamTableData.push(rowData);
  });
  teamTableData.sort((a, b) => b.totalStbl - a.totalStbl)

  return (
    <>
      <Table striped bordered hover size="sm">
        <TeamResultsTableHeaders currTournament={currTournament}/>
        <TeamResultsTableRows currTournament={currTournament} teamTableData={teamTableData}/>
      </Table>
    </>
  )
}


const Stav = () => {

  const [radioValue, setRadioValue] = useState('1');

  //load data
  const authEmail = useAuth();
  const users = useUsers();
  const tournaments = useTournaments();
  const scorecards = useScorecards();

  // If not logged in, redirect to login page
  if (!authEmail) {
    return <Navigate to="/login" />;
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