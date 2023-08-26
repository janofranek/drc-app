import React, {useState, useEffect} from 'react';
import "./Common.css"
import { useMatches } from '../data/MatchesDataProvider';
import ModalEditRyderScore from "./ModalEditRyderScore"
import { getRyderHoleClass, getRyderMatchClass, getRyderMatchText } from "./Utils"

const InfoMatch = (props) => {

  return (
    <>
      <div className="centeralign">
        <table className="scoretable">
          <tbody>
            <tr>
              <td className="stt-final pad-left-right">{props.match.players_stt.join(" + ")}</td>
              <td rowSpan={2} className='centerrow'>
                <div className={getRyderMatchClass(props.match)}>{getRyderMatchText(props.match)}</div>
              </td>
            </tr>
            <tr>
              <td className="lat-final pad-left-right">{props.match.players_lat.join(" + ")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
  
const HoleNumbers = (props) => {
  const getHoleNr = (i) => {return props.nine * 9 - 8 + i}
  return (
    <>
      <thead key={"hole_numbers_"+props.nine}><tr>
        <th className="centerrow" key={"hole_hash_"+props.nine}>#</th>
        {Array.from(Array(9).keys()).map((index) => { return <th className="centerrow" key={"hole_nr_" + getHoleNr(index)}>{getHoleNr(index)}</th> })}
      </tr></thead>
    </>
  )
}
  

const HoleRyderMatchScore = (props) => {
  const [localNine, setLocalNine] = useState([]);

  useEffect(() => {
    let newNine = new Array(9).fill(null); 
    for (let i in props.nineHoles) {
      newNine[i] = props.nineHoles[i];
    }
    setLocalNine(newNine);
  },[props]);

  
  
  const onDivClick = (e) => {
    e.preventDefault();
    const holeNr = props.nine * 9 - 8 + Number(e.target.id)
    // allow score cancellation only on last played hole
    props.setDisabledNehrano(!(props.match.holes[holeNr] == null))
    let fire = false;
    // allow on first hole, if the match is not finished
    if ( holeNr === 1 && !props.match.final) {
      fire = true;
    // allow, if there are no previous unplayed holes and the match is not finished
    } else if (!(props.match.holes[holeNr-2] == null) && !props.match.final) {
      fire = true;
    // allow, if the match is finished, but it is the last hole with score
    } else if (props.match.final && props.match.holes[holeNr] == null && !(props.match.holes[holeNr-1] == null)) {
      fire = true;
    }

    if ( fire ) {
      props.setMatchId(props.match.id);
      props.setHoleNr(holeNr)
      props.onClick(e);
    }
  }

  return (
    <>
      <tr>
        <td></td>
        {localNine.map((hole, index) => { 
          return <td key={"hole_score_"+index} className="centerrow">
            <div key={"hole_cell_" + index}
              id={index}
              className={getRyderHoleClass(hole)} 
              onClick={onDivClick}
            />
            </td> 
          })}
      </tr>
    </>
  )
}
  
const ScorecardRyderMatchNine = (props) => {

  const nineHoles = props.match.holes.slice((props.nine * 9 - 9), (props.nine * 9))

  return (
    <>
      <HoleNumbers nine={props.nine}/>
      <tbody>
        <HoleRyderMatchScore 
          nine={props.nine} 
          nineHoles={nineHoles} 
          match={props.match} 
          onClick={props.onClick}
          setMatchId={props.setMatchId}
          setHoleNr={props.setHoleNr}
          setDisabledNehrano={props.setDisabledNehrano}
            />
      </tbody>
    </>
  )
}
  
export const ScorecardRyderMatch = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [matchId, setMatchId] = useState(null);
  const [holeNr, setHoleNr] = useState(null);
  const [disabledNehrano, setDisabledNehrano] = useState(true);

  const matches = useMatches();

  if(!matches) {
    return ("Loading...")
  }

  const matchFilter = matches.filter(m => {return m.id.substring(0, 10) === props.currentRound.date && (m.players_lat.includes(props.currentUser.id) || m.players_stt.includes(props.currentUser.id))})
  if (matchFilter.length === 0) {
    return ("Nenašel jsem zápas")
  }
  const match = matchFilter[0];

  const onScoreEdit = (e) => {
    e.preventDefault();

    if (props.readOnly) return;
    setShowModal(true);

  }

  const ninesScores = Array.from({ length: props.currentRound.holes / 9 }, (_, index) => (
    <ScorecardRyderMatchNine 
      nine={index+1} 
      match={match} 
      onClick={onScoreEdit}
      setMatchId={setMatchId}
      setHoleNr={setHoleNr}
      setDisabledNehrano={setDisabledNehrano}
    />
  ));

  const hideModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <InfoMatch match={match} />
      <table className="scoretable">
        <colgroup>
          <col className="scoretablefirstcol" />
          <col span = "9" className="scoretablecol" />
        </colgroup>
        {ninesScores}
      </table>
      <ModalEditRyderScore
        showModal={showModal} 
        hideModal={hideModal} 
        matchId={matchId}
        holeNr={holeNr}
        disabledNehrano={disabledNehrano}
        totalHolesCount={props.currentRound.holes}
      />
    </>
  )
}
