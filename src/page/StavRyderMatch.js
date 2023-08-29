import React, { useState } from 'react';
import { Accordion, Table } from "react-bootstrap";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import { useUsers } from '../data/UsersDataProvider';
import { useMatches } from '../data/MatchesDataProvider';
import ModalRyderMatch from "./ModalRyderMatch"
import { getRyderMatchClass, getRyderMatchText, getRyderStandings, formatRyderStatus, checkUserAdmin } from "./Utils.js";

export const StavRyderMatchInfo = (props) =>  {

  const holesPlayed = props.match.holes.filter(h => !(h == null) ).length;

  const onClick = (e) => {
    e.preventDefault();
    props.setShowMatch(props.match);
    props.setRoundHoles(props.round.holes);
    props.setShowMatchModal(true);
  }

  return (
    <>
      <tr key={props.match.id}>
        <td className="pad-left-right">{props.match.players_stt.join(" + ")}</td>
        <td className="pad-left-right">{props.match.players_lat.join(" + ")}</td>
        <td>{props.match.final ? "\u2714" : holesPlayed}</td>
        <td><div 
              className={getRyderMatchClass(props.match, true)}
              key={props.match.id}
              id={props.match.id}
              onClick={onClick}
            >
          {getRyderMatchText(props.match)}
        </div></td>
      </tr>
    </>
  )
}

const HeaderRyderMatchesDay = (props) =>  {

  const dayStandings = getRyderStandings(props.matches, props.round.date);
  const allMatchesFinal = (props.matches.filter(m => (m.id.substring(0, 10) === props.round.date && !m.final)).length === 0)

  return (
    <table className="ryder-score-table">
      <tbody>
        <tr>
          <td rowSpan={2}>{props.round.date}</td>
          <td><div className="ryder-score-total-small stt-final">{formatRyderStatus(dayStandings.sttFinal)}</div></td>
          <td><div className="ryder-score-total-small lat-final">{formatRyderStatus(dayStandings.latFinal)}</div></td>
          <td></td>
        </tr>
        {!allMatchesFinal &&
          <tr>
            <td><div className="ryder-score-total-small stt-prelim">{formatRyderStatus(dayStandings.sttPrelim)}</div></td>
            <td><div className="ryder-score-total-small lat-prelim">{formatRyderStatus(dayStandings.latPrelim)}</div></td>
          </tr>
        }
      </tbody>
    </table>
  )
}

const StavRyderMatchesDay = (props) =>  {

  const roundMatches = props.matches.filter( match => match.id.substring(0, 10) === props.round.date )

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
          <StavRyderMatchInfo 
            match={match} 
            round={props.round}
            setShowMatchModal={props.setShowMatchModal} 
            setShowMatch={props.setShowMatch} 
            setRoundHoles={props.setRoundHoles}
          />
        )
      })}
      </tbody>
    </Table>
  )
}

const StavRyderMatch = (props) =>  {
  const [ showMatchModal, setShowMatchModal ] = useState(false);
  const [ showMatch, setShowMatch ] = useState(null);
  const [ roundHoles, setRoundHoles ] = useState(0);
  
  //load data
  const authEmail = useAuth();
  const matches = useMatches();
  const users = useUsers();

  if(!matches) {
    return ("Loading...")
  }

  const currentRoundIndex = props.tournament.rounds.findIndex( round => round.active === "1" )

  const hideModal = () => {
    setShowMatchModal(false);
  }
    
  return (
    <>
      <Accordion defaultActiveKey={[currentRoundIndex]} alwaysOpen>
        {props.tournament.rounds.map((round, index) => {
          return (
            <Accordion.Item eventKey={index} key={index} >
              <Accordion.Header>
                <HeaderRyderMatchesDay 
                  tournament={props.tournament} 
                  matches={matches} 
                  round={round} 
                />
              </Accordion.Header>
              <Accordion.Body>
                <StavRyderMatchesDay 
                  tournament={props.tournament} 
                  matches={matches} 
                  round={round}
                  setShowMatchModal={setShowMatchModal} 
                  setShowMatch={setShowMatch} 
                  setRoundHoles={setRoundHoles} 
                />
              </Accordion.Body>
            </Accordion.Item>
          )
        })}
      </Accordion>
      <ModalRyderMatch
        showModal={showMatchModal}
        hideModal={hideModal}
        match={showMatch}
        roundHoles={roundHoles}
        readOnly={!checkUserAdmin(authEmail, users)}
      />
    </>
  )
}

export default StavRyderMatch