import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { createUser, updateUser } from "../utils/Utils";
import { auth } from '../cred/firebase';

const UserModal = (props) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    short: '',
    admin: false,
    cgf: '',
    hcp: '',
    tee: 'yellow'
  });

  useEffect(() => {
    if (props.user) {
      setFormData({
        email: props.user.email || '',
        name: props.user.name || '',
        short: props.user.short || '',
        admin: props.user.admin || false,
        cgf: props.user.cgf || '',
        hcp: props.user.hcp || '',
        tee: props.user.tee || 'yellow'
      });
    } else {
      setFormData({
        email: '',
        name: '',
        short: '',
        admin: false,
        cgf: '',
        hcp: '',
        tee: 'yellow'
      });
    }
  }, [props.user, props.show]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      alert("Zadejte prosím platnou emailovou adresu (např. user@example.com)");
      return;
    }
    if (formData.name.trim().split(/\s+/).length < 2) {
      alert("Zadejte prosím celé jméno (jméno a příjmení).");
      return;
    }
    try {
      if (props.user) {
        await updateUser(props.user.id, formData);
      } else {
        await createUser(formData);
      }
      props.handleClose();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Nepodařilo se uložit uživatele: " + error.message);
    }
  };

  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{props.user ? 'Upravit uživatele' : 'Vytvořit nového uživatele'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label>Email *</Form.Label>
              <Form.Control type="email" placeholder="Zadejte email" name="email" value={formData.email} onChange={handleChange} required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Zadejte prosím platnou emailovou adresu (např. user@example.com)" />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridName">
              <Form.Label>Celé jméno *</Form.Label>
              <Form.Control type="text" placeholder="Celé jméno" name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridCgf">
              <Form.Label>ČGF</Form.Label>
              <Form.Control type="text" placeholder="ČGF Číslo" name="cgf" value={formData.cgf} onChange={handleChange} />
            </Form.Group>
            <Form.Group as={Col} controlId="formGridHcp">
              <Form.Label>HCP</Form.Label>
              <Form.Control type="number" step="0.1" placeholder="HCP" name="hcp" value={formData.hcp} onChange={handleChange} />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridTee">
              <Form.Label>Odpaliště</Form.Label>
              <Form.Select name="tee" value={formData.tee} onChange={handleChange}>
                <option value="yellow">Žlutá</option>
                <option value="white">Bílá</option>
                <option value="blue">Modrá</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} className="d-flex align-items-center" controlId="formGridAdmin">
              <Form.Check
                type="checkbox"
                label="Administrátor"
                name="admin"
                checked={formData.admin}
                onChange={handleChange}
                disabled={props.user && auth.currentUser && props.user.email === auth.currentUser.email}
                title={props.user && auth.currentUser && props.user.email === auth.currentUser.email ? "Nemůžete zrušit administrátorská práva sami sobě" : ""}
              />
            </Form.Group>
          </Row>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>
            Zavřít
          </Button>
          <Button variant="primary" type="submit">
            Uložit změny
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
