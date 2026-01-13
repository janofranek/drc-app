import React, { useState } from 'react';
import "./Common.css"
import { Modal, Button } from "react-bootstrap";
import { setMatchScore, getRyderHoleScore } from "../utils/Utils.js"

const ModalEditRyderScore = (props) => {
  const [disabledButtons, setDisabledButtons] = useState(false);

  const onButtonClick = (e) => {
    e.preventDefault();
    setDisabledButtons(true);
    setMatchScore(props.matchId, props.holeNr, getRyderHoleScore(e.target.id), props.totalHolesCount)
    props.hideModal()
    setDisabledButtons(false);
  }

  return (
    <>
      <Modal show={props.showModal} onHide={props.hideModal} backdrop="static" size='sm'>
        <Modal.Header closeButton>
          <Modal.Title>
            Zápas {props.matchId} - jamka {props.holeNr}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='flex-container'>
            <Button
              id="stt"
              variant='primary'
              disabled={disabledButtons}
              onClick={onButtonClick}
            >
              STT
            </Button>
            <Button
              id="rem"
              variant='secondary'
              disabled={disabledButtons}
              onClick={onButtonClick}
            >
              rem
            </Button>
            <Button
              id="lat"
              variant='danger'
              disabled={disabledButtons}
              onClick={onButtonClick}
            >
              LAT
            </Button>
            <Button
              id="neh"
              variant='outline-dark'
              disabled={disabledButtons || props.disabledNehrano}
              onClick={onButtonClick}
            >
              neh
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ModalEditRyderScore;