import React from 'react';
import "./Common.css"
import { Modal } from "react-bootstrap";
import { ScorecardRyderMatchId } from "./ScorecardRyderMatch";

const ModalRyderMatch = (props) => {
  return (
    <>
      <Modal show={props.showModal} onHide={props.hideModal} backdrop="static" size='sm'>
        <Modal.Header closeButton />
        <Modal.Body>
          <ScorecardRyderMatchId 
            match={props.match} 
            roundHoles={props.roundHoles} 
            readOnly={props.readOnly}
          />
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ModalRyderMatch;