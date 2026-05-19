import React, { useState } from 'react';
import { Table, Modal, Button } from "react-bootstrap";
import "./Common.css"
import { useTournaments } from '../data/TournamentsDataProvider';
import { useScorecards } from '../data/ScorecardsDataProvider';
import { ScorecardPlayer } from "./ScorecardPlayer.jsx"
import { getScorecardId, getNettoRoundScore, getNettoTeamRoundScore } from "../utils/Utils.jsx"

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
        <ScorecardPlayer scorecardId={props.scorecardId} readOnly={true} tournamentSystem="netto" />
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
          return (<React.Fragment key={"R" + round.date + props.counter}><td key={"R" + round.date + props.counter + "_td"}>
            <Button variant='link' type='submit' onClick={handleShow} id={getScorecardId(round.date, props.dataRow.player)} key={getScorecardId(round.date, props.dataRow.player)}>
              {props.dataRow[round.date + "_score"]}/{props.dataRow[round.date + "_netto"]}
            </Button>
          </td></React.Fragment>)
        })}
        <th key="DRTR" className="vertcenter">{props.dataRow.totalScore}/{props.dataRow.totalNetto}</th>
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
          return (<ResultsTableRow key={index} counter={index} dataRow={row} currTournament={props.currTournament} />)
        })}
      </tbody>
    </>
  )
}

const getResultsDataTable = (currTournament, scorecards) => {
  let resultsTableData = [];

  currTournament.players.forEach((player) => {
    let rowData = { "player": player }
    let totalScore = 0, totalNetto = 0
    currTournament.rounds.forEach((round) => {
      const [roundScore, roundNetto] = getNettoRoundScore(player, round.date, scorecards)
      rowData[round.date + "_score"] = roundScore
      rowData[round.date + "_netto"] = roundNetto
      totalScore = totalScore + roundScore
      totalNetto = totalNetto + roundNetto
    });
    rowData.totalScore = totalScore
    rowData.totalNetto = totalNetto
    resultsTableData.push(rowData);
  });

  return resultsTableData
}

export const NettoStandingsIndividuals = (props) => {
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
  resultsTableData.sort((a, b) => {
    if (a.totalScore === 0 && b.totalScore !== 0) return 1;
    if (b.totalScore === 0 && a.totalScore !== 0) return -1;
    return a.totalNetto - b.totalNetto;
  });

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
          return (<React.Fragment key={"R" + round.date + props.counter}><td key={"R" + round.date + props.counter + "_td"}>
            {props.dataRow[round.date + "_netto"]}
          </td></React.Fragment>)
        })}
        <th key="DRTR">{props.dataRow.totalNetto}</th>
      </tr>
    </>
  )
}

const TeamResultsTableRows = (props) => {
  return (
    <>
      <tbody>
        {props.teamTableData.map((row, index) => {
          return (<TeamResultsTableRow key={index} counter={index} dataRow={row} currTournament={props.currTournament} />)
        })}
      </tbody>
    </>
  )
}

export const NettoStandingsTeams = (props) => {
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
    let totalNetto = 0;
    let totalScore = 0;
    tournament.rounds.forEach((round) => {
      const roundNetto = getNettoTeamRoundScore(team, round.date, resultsTableData)
      rowData[round.date + "_netto"] = roundNetto
      totalNetto = totalNetto + roundNetto
    });
    team.players.forEach(player => {
      const playerRow = resultsTableData.find(r => r.player === player);
      if (playerRow && playerRow.totalScore !== undefined) {
        totalScore += playerRow.totalScore;
      }
    });
    rowData.totalNetto = totalNetto;
    rowData.totalScore = totalScore;
    teamTableData.push(rowData);
  });
  teamTableData.sort((a, b) => {
    if (a.totalScore === 0 && b.totalScore !== 0) return 1;
    if (b.totalScore === 0 && a.totalScore !== 0) return -1;
    return a.totalNetto - b.totalNetto;
  });

  return (
    <>
      <Table striped bordered hover size="sm">
        <TeamResultsTableHeaders currTournament={tournament} />
        <TeamResultsTableRows currTournament={tournament} teamTableData={teamTableData} />
      </Table>
    </>
  )
}
