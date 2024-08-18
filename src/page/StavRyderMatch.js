import React, { useState, useMemo } from 'react';
import { Accordion, Table } from "react-bootstrap";
import "./Common.css"
import { useAuth } from '../data/AuthProvider';
import { useUsers } from '../data/UsersDataProvider';
import { useMatches } from '../data/MatchesDataProvider';
import ModalRyderMatch from "./ModalRyderMatch"
import { getRyderMatchClass, getRyderMatchText, getRyderStandings, formatRyderStatus, checkUserAdmin } from "./Utils.js";
import logoStt from "../assets/DRCstandard.png"
import logoLat from "../assets/DRClatin.png"

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

const StavRyderMatchInfoFinal = (props) =>  {

  const roundHoles = props.tournament.rounds.filter(r => !(r.date === props.match.id.substring(0, 10)) )[0].holes;

  const onClick = (e) => {
    e.preventDefault();
    props.setShowMatch(props.match);
    props.setRoundHoles(roundHoles);
    props.setShowMatchModal(true);
  }

  return (
    <>
      <tr key={props.match.id}>
        <td className="pad-left-right">{props.match.id}</td>
        <td className="pad-left-right">{props.match.players_stt.join(" + ")}</td>
        <td className="pad-left-right">{props.match.players_lat.join(" + ")}</td>
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

  const dayStandings = getRyderStandings(props.matches, props.round.date, props.round.date);
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

const ShowRyderMatchStatus = (props) => {

  const classesStt = ['ryder-score-total'];
  const classesLat = ['ryder-score-total'];
  if (props.prelim === "1") {
    classesStt.push('stt-prelim');
    classesLat.push('lat-prelim');
  } else {
    classesStt.push('stt-final');
    classesLat.push('lat-final');
  }

  return (
    <>
    <tr>
      <td colSpan={2}>{props.txt}</td>
    </tr>
    <tr>
      <td><div className={classesStt.join(' ')}>{formatRyderStatus(props.sttScore)}</div></td>
      <td><div className={classesLat.join(' ')}>{formatRyderStatus(props.latScore)}</div></td>
    </tr>
    </>
  )

}

const ShowRyderMatchHeader = (props) => {

  return (
    <>
      <table>
        <thead>
          <tr>
            <th colSpan={2}><div className="centeralign">{props.tournamentInfo}</div></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><img className="drcimage" src={logoStt} alt="DRC logo standard" /></td>
            <td><img className="drcimage" src={logoLat} alt="DRC logo latin" /></td>
          </tr>
        </tbody>
      </table>
    </>
  )


}

export const StavRyderMatchTotal = (props) => {

  const ryderMatchStatus = useMemo(
    () => { 
      return getRyderStandings(props.matches, props.tournament.datestart, props.tournament.dateend);
    },
    [props]
  )

  return (
    <>
      <div className="ryder-score-table">
      <ShowRyderMatchHeader tournamentInfo={props.tournament.info}/>
      </div>
      <div className="ryder-score-table">
      <table>
        <tbody>
          <ShowRyderMatchStatus txt="Stav" prelim="0" sttScore={ryderMatchStatus.sttFinal} latScore={ryderMatchStatus.latFinal} />
          {props.tournament.active === "1" && <ShowRyderMatchStatus txt="Průběžný stav" prelim="1" sttScore={ryderMatchStatus.sttPrelim} latScore={ryderMatchStatus.latPrelim} /> }
        </tbody>
      </table>
      </div>
    </>
  )

}

export const StavRyderMatchDetail = (props) =>  {
  const [ showMatchModal, setShowMatchModal ] = useState(false);
  const [ showMatch, setShowMatch ] = useState(null);
  const [ roundHoles, setRoundHoles ] = useState(0);

  const tournamentMatches = props.matches.filter( match => ( match.id.substring(0,10) >= props.tournament.datestart && match.id.substring(0,10) <= props.tournament.dateend))

  const hideModal = () => {
    setShowMatchModal(false);
  }

  if (tournamentMatches.length === 0) {
    return ("Nenašel jsem žádné zápasy pro tento turnaj")
  }

  return (
    <>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Id</th>
            <th>STT</th>
            <th>LAT</th>
            <th>Stav</th>
          </tr>
        </thead>
        <tbody>
        {tournamentMatches.map((match, index) => {
          return (
            <StavRyderMatchInfoFinal 
              tournament={props.tournament}
              match={match} 
              setShowMatchModal={setShowMatchModal} 
              setShowMatch={setShowMatch} 
              setRoundHoles={setRoundHoles}
            />
          )
        })}
        </tbody>
      </Table>
      <ModalRyderMatch
        showModal={showMatchModal}
        hideModal={hideModal}
        match={showMatch}
        roundHoles={roundHoles}
        readOnly={true}
      />
    </>
  
  )
}

export default StavRyderMatch