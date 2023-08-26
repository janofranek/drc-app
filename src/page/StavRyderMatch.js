import React from 'react';
import { Accordion, Table } from "react-bootstrap";
import "./Common.css"
import { useMatches } from '../data/MatchesDataProvider';
import { getRyderMatchClass, getRyderMatchText } from "./Utils.js"

const StavRyderMatchInfo = (props) =>  {

  return (
    <>
      <tr key={props.match.id}>
        <td className="pad-left-right">{props.match.players_stt.join(" + ")}</td>
        <td className="pad-left-right">{props.match.players_lat.join(" + ")}</td>
        <td>{props.match.final ? "\u2714" : ""}</td>
        <td><div className={getRyderMatchClass(props.match, true)}>{getRyderMatchText(props.match)}</div></td>
      </tr>
    </>
  )
}

const StavRyderMatchesDay = (props) =>  {
  //load data
  const matches = useMatches();

  if(!matches) {
    return ("Loading...")
  }

  const roundMatches = matches.filter( match => match.id.substring(0, 10) === props.tournament.rounds[props.roundIndex].date )

  if (roundMatches.length === 0) {
    return ("Nenašel jsem žádné zápasy pro tento den")
  }

  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>STT</th>
          <th>LAT</th>
          <th>Hotovo</th>
          <th>Stav</th>
        </tr>
      </thead>
      <tbody>
      {roundMatches.map((match, index) => {
        return (
          <StavRyderMatchInfo match={match} />
        )
      })}
      </tbody>
    </Table>
  )
}

const StavRyderMatch = (props) =>  {

  const currentRoundIndex = props.tournament.rounds.findIndex( round => round.active === "1" )
    
  return (
    <>
      <Accordion defaultActiveKey={[currentRoundIndex]} alwaysOpen>
        {props.tournament.rounds.map((round, index) => {
          return (
            <Accordion.Item eventKey={index} key={index} >
              <Accordion.Header>{round.date}</Accordion.Header>
              <Accordion.Body>
                <StavRyderMatchesDay tournament={props.tournament} roundIndex={index} />
              </Accordion.Body>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </>
  )
}

export default StavRyderMatch