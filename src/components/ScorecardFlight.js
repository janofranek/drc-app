import React, { useState } from 'react';
import { Accordion, Button } from "react-bootstrap";
import "./Common.css"
import { useUsers } from '../data/UsersDataProvider';
import { useScorecards } from '../data/ScorecardsDataProvider';
import { ScorecardPlayer } from "./ScorecardPlayer.js"
import { getScorecardId, setHoleScore } from "../utils/Utils.js"


export const ScoreFlightAccHeader = (props) => {

  const scorecards = useScorecards();

  if (!scorecards) {
    return ("Loading...")
  }

  const scorecardId = getScorecardId(props.currentRound.date, props.player)
  const scorecard = scorecards.filter(s => s.id === scorecardId)[0];

  const score = scorecard.holes.reduce((a, v) => a = a + v.score, 0)
  const stbl = scorecard.holes.reduce((a, v) => a = a + v.stableford, 0)

  return (
    <Accordion.Header>
      <table className="acctable">
        <colgroup>
          <col className="acctablecolname" />
          <col className="acctablecolscore" />
        </colgroup>
        <theader>
          <tr>
            <th className="acctablecolname">{props.player}</th>
            <th className="acctablecolscore">{score} / {stbl}</th>
          </tr>
        </theader>
      </table>
    </Accordion.Header>
  )
}

export const ScoreFlightAccBody = (props) => {
  const scorecardId = getScorecardId(props.currentRound.date, props.player)
  return (
    <Accordion.Body>
      <ScorecardPlayer scorecardId={scorecardId} readOnly={props.readOnly} />
    </Accordion.Body>
  )
}

const ScoreFlightCell = (props) => {

  function handleBlur(e) {
    e.preventDefault();
    let newValue = e.target.value;
    if (newValue.trim() === "") { newValue = "0" }
    newValue = parseInt(newValue).toString()
    props.setFormData({
      ...props.formData,
      [e.target.id]: newValue,
    });
    const [scorecardId, holeNumber] = e.target.id.split("/")
    setHoleScore(scorecardId, holeNumber, newValue)
  }

  function handleChange(e) {
    e.preventDefault();
    props.setFormData({
      ...props.formData,
      [e.target.id]: e.target.value,
    });
  }

  const handleKeyPress = (e) => {
    const charCode = e.charCode;
    const inputChar = String.fromCharCode(charCode);

    // Check if the input character would result in an invalid value
    if (!/^\d{1,3}$/.test(e.target.value + inputChar)) {
      e.preventDefault();
    }
  };

  const handleFocus = (e) => {
    e.preventDefault();
    e.target.setSelectionRange(0, e.target.value.length)
  }

  return (
    <td>
      <label for={"score" + props.data.short}>{props.data.short}</label><br />
      <input type="tel"
        className="flightscoreinput"
        id={props.data.scorecardId + "/" + props.holeSelect}
        name={props.data.scorecardId + "/" + props.holeSelect}
        key={props.data.scorecardId + "/" + props.holeSelect}
        size="3"
        maxlength="2"
        min="0"
        max="99"
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        required
        // value={props.data.scorecard.holes[props.holeSelect-1].score}
        value={props.formData[props.data.scorecardId + "/" + props.holeSelect] ?? props.data.scorecard.holes[props.holeSelect - 1].score}
      />
    </td>

  )
}

export const ScoreFlightTable = (props) => {

  const [formData, setFormData] = useState({})
  const [holeSelect, setHoleSelect] = useState(1)

  const scorecards = useScorecards();
  const users = useUsers();

  //while data not loaded, show Loading...
  if (!users || !scorecards) return "Loading..."

  const onSelectChange = (e) => {
    e.preventDefault();
    let holeSelectNew = e.target.value
    if (parseInt(holeSelectNew) < 1 || parseInt(holeSelectNew) > 18) { holeSelectNew = 1 }
    setHoleSelect(holeSelectNew)
  }

  const onButtonLeft = (e) => {
    e.preventDefault();
    const holeSelectNew = (holeSelect <= 1 ? 1 : parseInt(holeSelect) - 1)
    setHoleSelect(holeSelectNew)
  }

  const onButtonRight = (e) => {
    e.preventDefault();
    const holeSelectNew = (holeSelect >= 18 ? 18 : parseInt(holeSelect) + 1)
    setHoleSelect(holeSelectNew)
  }

  const flightData = {};
  props.currentFlight.forEach(player => {
    const scorecardId = getScorecardId(props.currentRound.date, player)
    let data = {}
    data.scorecardId = scorecardId
    data.playerId = player
    data.short = users.filter(u => u.id === player)[0].short
    data.scorecard = scorecards.filter(s => s.id === scorecardId)[0]
    flightData[data.short] = data
  });

  return (
    <>
      <table className="flighttable">
        <colgroup>
          <col span={flightData.length + 3} className="scoretablecol" />
        </colgroup>
        <tbody>
          <tr>
            <td>
              <Button variant="primary" onClick={onButtonLeft}>&lt;&lt;</Button>
            </td>
            <td>
              <label for="holeSelect" className="thick">Jamka</label><br />
              <input type="tel"
                className="flightscoreinput thick"
                id="holeSelect"
                name="holeSelect"
                maxlength="2"
                min="1"
                max="18"
                value={holeSelect}
                required
                readonly
                onChange={onSelectChange} />
            </td>
            {Object.keys(flightData).map((key) => { return <ScoreFlightCell holeSelect={holeSelect} data={flightData[key]} formData={formData} setFormData={setFormData} /> })}
            <td>
              <Button variant="primary" onClick={onButtonRight}>&gt;&gt;</Button>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

