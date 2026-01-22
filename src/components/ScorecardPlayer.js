import React, { useState } from 'react';
import { Table } from "react-bootstrap";
import "./Common.css"
import { useUsers } from '../data/UsersDataProvider';
import { useScorecards } from '../data/ScorecardsDataProvider';
import { setHoleScore } from "../utils/Utils.js"

export const InfoPlayer = (props) => {

  const scorecards = useScorecards();
  const users = useUsers();

  if (!scorecards || !users) {
    return ("Loading...")
  }

  const scorecard = scorecards.filter(s => s.id === props.scorecardId)[0];
  const user = users.filter(u => u.id === scorecard.player)[0]
  const roudDate = scorecard.id.substring(0, 10)

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
            <td>{scorecard.player}</td>
            <td>{user.hcp}</td>
            <td>{(scorecard.tee === "yellow" ? <span className="yellowdot"></span> : <span className="whitedot"></span>)}</td>
            <td>{scorecard.playingHCP}</td>
            <td>{roudDate}</td>
            <td className="thick scorecell">{scorecard.holes.reduce((a, v) => a = a + v.score, 0)}</td>
            <td className="thick scorecell">{scorecard.holes.reduce((a, v) => a = a + v.stableford, 0)}</td>
          </tr>
        </tbody>
      </Table>
    </>
  )
}

const HoleNumbers = (props) => {
  return (
    <>
      <thead key={"hole_numbers_" + props.nine}><tr>
        <th className="centerrow" key={"hole_hash_" + props.nine}>#</th>
        {props.nineHoles.map((hole) => { return <th className="centerrow" key={"hole_nr_" + hole.hole}>{hole.hole}</th> })}
        <th className="centerrow" key={"hole_sum_" + props.nine}>&sum;</th>
      </tr></thead>
    </>
  )
}

const Dots = (props) => {
  if (props.shots === -1) {
    return (<span class="reddot" key={"dot" + props.hole}></span>)
  } else if (props.shots === 0) {
    return (<span key={"dot" + props.hole}></span>)
  } else {
    return (
      <>
        {Array.from({ length: props.shots }).map((value, index) => { return <><span className="dot" key={"dot" + props.hole + "-" + index.toString()}></span> </> })}
      </>
    )
  }
}

const HoleScore = (props) => {
  const [formData, setFormData] = useState({});

  function handleBlur(e) {
    if (props.readOnly) { return }
    e.preventDefault();
    let newValue = e.target.value;
    if (newValue.trim() === "") { newValue = "0" }
    newValue = parseInt(newValue).toString()
    setFormData({
      ...formData,
      [e.target.id]: newValue,
    });
    setHoleScore(props.scorecardId, e.target.id, newValue)
  }

  function handleChange(e) {
    if (props.readOnly) { return }
    e.preventDefault();
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  }

  const handleKeyPress = (e) => {
    if (props.readOnly) { return }
    const charCode = e.charCode;
    const inputChar = String.fromCharCode(charCode);

    // Check if the input character would result in an invalid value
    if (!/^\d{1,3}$/.test(e.target.value + inputChar)) {
      e.preventDefault();
    }
  };

  const handleFocus = (e) => {
    if (props.readOnly) { return }
    e.preventDefault();
    e.target.setSelectionRange(0, e.target.value.length)
  }

  return (
    <>
      <tr>
        <td className="leftrow">Par</td>
        {props.nineHoles.map((hole) => { return <td className="parrow" key={"hole_par_" + hole.hole}>{hole.par}<br /><Dots hole={hole.hole} shots={hole.shots} /></td> })}
        <td className="centerrow"></td>
      </tr>
      <tr>
        <td className="leftrow scorecell">Skóre</td>
        {props.nineHoles.map((hole) => {
          return <td className="centerrow scorecell" key={"hole_score_" + hole.hole}>
            <input type="tel"
              id={hole.hole}
              key={"hole_input_" + hole.hole}
              pattern="\d{1,2}"
              size="2"
              maxLength="2"
              className="scoreinput"
              value={formData[hole.hole] ?? hole.score}
              required
              onBlur={handleBlur}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              onFocus={handleFocus}
            /></td>
        })}
        <th className="centerrow scorecell" >{props.nineHoles.reduce((a, v) => a = a + v.score, 0)}</th>
      </tr>
      <tr>
        <td className="leftrow">Stbl</td>
        {props.nineHoles.map((hole) => { return <td className="centerrow" key={"hole_stbl_" + hole.hole}>{hole.stableford}</td> })}
        <th className="centerrow">{props.nineHoles.reduce((a, v) => a = a + v.stableford, 0)}</th>
      </tr>
    </>
  )
}

const ScorecardNine = (props) => {
  const nineHoles = props.scorecard.holes.slice((props.nine === 1 ? 0 : 9), (props.nine === 1 ? 9 : 18))
  return (
    <>
      <HoleNumbers nine={props.nine} nineHoles={nineHoles} />
      <tbody>
        <HoleScore nine={props.nine} nineHoles={nineHoles} scorecardId={props.scorecard.id} readOnly={props.readOnly} />
      </tbody>
    </>
  )
}

export const ScorecardPlayer = (props) => {
  const scorecards = useScorecards();

  if (!scorecards) {
    return ("Loading...")
  }

  if (scorecards.filter(s => s.id === props.scorecardId).length === 0) {
    return ("Skorka neexistuje")
  }

  const scorecard = scorecards.filter(s => s.id === props.scorecardId)[0];

  return (
    <>
      <table className="scoretable">
        <colgroup>
          <col className="scoretablefirstcol" />
          <col span="10" className="scoretablecol" />
        </colgroup>
        <ScorecardNine nine={1} scorecard={scorecard} readOnly={props.readOnly} />
        <ScorecardNine nine={2} scorecard={scorecard} readOnly={props.readOnly} />
      </table>
    </>
  )
}
