import React, { useState } from 'react';
import { Table, Modal, Button } from "react-bootstrap";
import "./Common.css"
import { useTournaments } from '../data/TournamentsDataProvider';
import { useScorecards } from '../data/ScorecardsDataProvider';
import { ScorecardPlayer } from "./ScorecardPlayer.js"
import { getScorecardId, getRoundSkore, getTeamRoundSkore } from "../utils/Utils.js"

const ResultsTableHeaders = (props) => {
  return (
    <>
      <thead>
        <tr key="RHT">
          <th key="A">#</th>
          <th key="B" className="leftrow">Hráč</th>
          {props.currTournament.rounds.map((round, index) => {
            return (<th key={round.date}>{index + 1}. kolo</th>)
          })}
          <th key="C">Celkem</th>
        </tr>
      </thead>
    </>
  )
}

const ScorecardModal = (props) => {
  if (!props.scorecardId) {
    return (<></>)
  }

  return (
    <Modal show={props.showScorecard} onHide={props.handleClose} dialogClassName="scoremodal">
      <Modal.Header closeButton>
        <Modal.Title>{props.scorecardId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ScorecardPlayer scorecardId={props.scorecardId} readOnly={true} />
      </Modal.Body>
    </Modal>
  )
}

const ResultsTableRow = (props) => {
  const [showScorecard, setShowscorecard] = useState(false);
  const [scorecardId, setScorecardId] = useState(null);

  const handleClose = (e) => {
    setScorecardId(null)
    setShowscorecard(false);
  }

  const handleShow = (e) => {
    console.log("handleShow")
    console.log(e.target.id)
    setScorecardId(e.target.id)
    setShowscorecard(true);
  }

  return (
    <>
      <tr key={props.counter}>
        <th key="DRI" className="vertcenter">{props.counter + 1}</th>
        <td key="DRP" className="leftrow vertcenter">{props.dataRow.player}</td>
        {props.currTournament.rounds.map((round, index) => {
          return (<><td key={"R" + round.date + props.counter}>
            <Button variant='link' type='submit' onClick={handleShow} id={getScorecardId(round.date, props.dataRow.player)} key={getScorecardId(round.date, props.dataRow.player)}>
              {props.dataRow[round.date + "_skore"]}/{props.dataRow[round.date + "_stbl"]}
            </Button>
          </td></>)
        })}
        <th key="DRTR" className="vertcenter">{props.dataRow.totalSkore}/{props.dataRow.totalStbl}</th>
      </tr>
      <ScorecardModal showScorecard={showScorecard} scorecardId={scorecardId} handleClose={handleClose} />
    </>
  )
}

const ResultsTableRows = (props) => {
  return (
    <>
      <tbody>
        {props.resultsTableData.map((row, index) => {
          return (<ResultsTableRow counter={index} dataRow={row} currTournament={props.currTournament} />)
        })}
      </tbody>
    </>
  )
}

const getResultsDataTable = (currTournament, scorecards) => {
  let resultsTableData = [];

  currTournament.players.forEach((player) => {
    let rowData = { "player": player }
    let totalSkore = 0, totalStbl = 0
    currTournament.rounds.forEach((round) => {
      const [roundSkore, roundStbl] = getRoundSkore(player, round.date, scorecards)
      rowData[round.date + "_skore"] = roundSkore
      rowData[round.date + "_stbl"] = roundStbl
      totalSkore = totalSkore + roundSkore
      totalStbl = totalStbl + roundStbl
    });
    rowData.totalSkore = totalSkore
    rowData.totalStbl = totalStbl
    resultsTableData.push(rowData);
  });

  return resultsTableData
}

export const StablefordStandingsIndividuals = (props) => {
  //load data
  const tournaments = useTournaments();
  const scorecards = useScorecards();

  if (!scorecards || !tournaments) {
    return ("Loading...")
  }

  if (tournaments.filter(tournament => tournament.id === props.tournamentId).length === 0) {
    return (<>"Nenašel jsem turnaj " + {props.tournamentId}</>)
  }

  const tournament = tournaments.filter(tournament => tournament.id === props.tournamentId)[0];
  let resultsTableData = getResultsDataTable(tournament, scorecards);
  resultsTableData.sort((a, b) => b.totalStbl - a.totalStbl)

  return (
    <>
      <Table striped bordered hover size="sm">
        <ResultsTableHeaders currTournament={tournament} />
        <ResultsTableRows currTournament={tournament} resultsTableData={resultsTableData} />
      </Table>
    </>
  )
}

const TeamResultsTableHeaders = (props) => {
  return (
    <>
      <thead>
        <tr key="RHT">
          <th key="A">#</th>
          <th key="B" colSpan="2" className="leftrow">Tým</th>
          {props.currTournament.rounds.map((round, index) => {
            return (<th key={round.date}>{index + 1}. kolo</th>)
          })}
          <th key="C">Celkem</th>
        </tr>
      </thead>
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
          return (<><td key={"R" + round.date + props.counter}>
            {props.dataRow[round.date + "_stbl"]}
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
        {props.teamTableData.map((row, index) => {
          return (<TeamResultsTableRow counter={index} dataRow={row} currTournament={props.currTournament} />)
        })}
      </tbody>
    </>
  )
}

export const StablefordStandingsTeams = (props) => {
  //load data
  const tournaments = useTournaments();
  const scorecards = useScorecards();

  if (!scorecards || !tournaments) {
    return ("Loading...")
  }

  if (tournaments.filter(tournament => tournament.id === props.tournamentId).length === 0) {
    return (<>"Nenašel jsem turnaj " + {props.tournamentId}</>)
  }

  const tournament = tournaments.filter(tournament => tournament.id === props.tournamentId)[0];
  let resultsTableData = getResultsDataTable(tournament, scorecards);
  let teamTableData = [];
  tournament.teams.forEach(team => {
    let rowData = { "team": team }
    let totalStbl = 0
    tournament.rounds.forEach((round) => {
      const roundStbl = getTeamRoundSkore(team, round.date, resultsTableData)
      rowData[round.date + "_stbl"] = roundStbl
      totalStbl = totalStbl + roundStbl
    });
    rowData.totalStbl = totalStbl
    teamTableData.push(rowData);
  });
  teamTableData.sort((a, b) => b.totalStbl - a.totalStbl)

  return (
    <>
      <Table striped bordered hover size="sm">
        <TeamResultsTableHeaders currTournament={tournament} />
        <TeamResultsTableRows currTournament={tournament} teamTableData={teamTableData} />
      </Table>
    </>
  )
}