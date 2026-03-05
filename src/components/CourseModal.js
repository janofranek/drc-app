import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Tab, Row, Col, Form, Table } from 'react-bootstrap';
import { db } from '../cred/firebase';
import { doc, updateDoc, setDoc } from "firebase/firestore";

const CourseModal = ({ show, onHide, course }) => {
  const [selectedTab, setSelectedTab] = useState('base');

  const [formData, setFormData] = useState({
    id: '',
    resort: '',
    course: '',
    par: 72
  });
  const [localHoles, setLocalHoles] = useState([]);
  const [localTees, setLocalTees] = useState([]);

  useEffect(() => {
    if (course) {
      setFormData({
        id: course.id,
        resort: course.resort || '',
        course: course.course || '',
        par: course.par || 72
      });
      setLocalHoles(course.holes || []);
      setLocalTees(course.tees || []);
      setSelectedTab('base');
    } else {
      setFormData({
        id: '',
        resort: '',
        course: '',
        par: 72
      });
      setLocalHoles(Array.from({ length: 18 }, (_, i) => ({ hole: i + 1, par: 4, index: i + 1 })));
      setLocalTees([]);
      setSelectedTab('base');
    }
  }, [course, show]);

  const isCreating = !course;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: name === 'par' ? parseInt(value) || 0 : value };

      if (isCreating && (name === 'resort' || name === 'course')) {
        const resortName = name === 'resort' ? value : newData.resort;
        const courseName = name === 'course' ? value : newData.course;

        if (resortName || courseName) {
          const combined = [resortName, courseName].filter(Boolean).join('-');
          newData.id = combined
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        } else {
          newData.id = '';
        }
      }

      return newData;
    });
  };

  const handleHoleChange = (index, field, value) => {
    const newHoles = [...localHoles];
    newHoles[index] = { ...newHoles[index], [field]: parseInt(value) || 0 };
    setLocalHoles(newHoles);
  };

  const handleAddTee = () => {
    setLocalTees([...localTees, { color: '', CR: 0, SR: 0 }]);
  };

  const handleDeleteTee = (index) => {
    const newTees = [...localTees];
    newTees.splice(index, 1);
    setLocalTees(newTees);
  };

  const handleTeeChange = (index, field, value) => {
    const newTees = [...localTees];
    newTees[index] = { ...newTees[index], [field]: field === 'color' ? value : parseFloat(value) || 0 };
    setLocalTees(newTees);
  };

  const handleSave = async () => {
    if (!formData.id) {
      alert("ID hřiště je povinné.");
      return;
    }

    // Validation
    const totalPar = localHoles.reduce((sum, hole) => sum + (hole.par || 0), 0);
    if (totalPar !== formData.par) {
      alert(`Součet parů jamek (${totalPar}) se neshoduje s celkovým parem hřiště (${formData.par}).`);
      return;
    }

    const indexes = localHoles.map(h => h.index);
    const uniqueIndexes = new Set(indexes);
    if (uniqueIndexes.size !== localHoles.length) {
      alert("Indexy jamek musí být unikátní.");
      return;
    }

    const invalidIndexes = indexes.filter(i => i < 1 || i > 18);
    if (invalidIndexes.length > 0) {
      alert("Indexy jamek musí být v rozsahu 1 až 18.");
      return;
    }

    // Tee validations
    for (let i = 0; i < localTees.length; i++) {
      const t = localTees[i];
      if (!t.color) {
        alert(`Odpaliště na řádku ${i + 1} nemá vyplněnou barvu.`);
        return;
      }
      if (typeof t.CR !== 'number' || t.CR < 60 || t.CR > 80) {
        alert(`Odpaliště '${t.color}': CR musí být mezi 60 a 80.`);
        return;
      }
      if (typeof t.SR !== 'number' || t.SR < 50 || t.SR > 160 || !Number.isInteger(t.SR)) {
        alert(`Odpaliště '${t.color}': SR musí být celé číslo mezi 50 a 160.`);
        return;
      }
    }

    try {
      const courseData = {
        resort: formData.resort,
        course: formData.course,
        par: formData.par,
        holes: localHoles,
        tees: localTees
      };

      const courseRef = doc(db, "courses", formData.id);

      if (isCreating) {
        await setDoc(courseRef, courseData);
      } else {
        await updateDoc(courseRef, courseData);
      }
      onHide();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Nepodařilo se uložit změny: " + error.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isCreating ? 'Nové hřiště' : `Správa hřiště: ${course?.resort} - ${course?.course}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} className="mb-3">
          <Tab eventKey="base" title="Základní údaje">
            <Form className="mt-3">
              <Form.Group className="mb-3">
                <Form.Label>ID hřiště (unikátní, např. kaskada-zeleza)</Form.Label>
                <Form.Control
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  disabled={!isCreating}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Resort</Form.Label>
                <Form.Control
                  type="text"
                  name="resort"
                  value={formData.resort}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Hřiště (konkrétní název 18j kombinace)</Form.Label>
                <Form.Control
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Celkový Par</Form.Label>
                <Form.Control
                  type="number"
                  name="par"
                  value={formData.par}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Form>
          </Tab>
          <Tab eventKey="holes" title="Jamky">
            <Row className="mt-3">
              {[0, 9].map((offset) => (
                <Col md={6} key={offset}>
                  <h6 className="text-center">{offset === 0 ? 'První devítka (1-9)' : 'Druhá devítka (10-18)'}</h6>
                  <Table size="sm" bordered hover className="mt-2 text-center">
                    <thead>
                      <tr>
                        <th className="align-middle">Jamka</th>
                        <th>Par</th>
                        <th>Index</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localHoles.slice(offset, offset + 9).map((hole, localIndex) => {
                        const index = offset + localIndex;
                        return (
                          <tr key={index}>
                            <td className="align-middle fw-bold">{hole.hole}</td>
                            <td style={{ width: '80px' }}>
                              <Form.Control
                                type="number"
                                size="sm"
                                value={hole.par}
                                onChange={(e) => handleHoleChange(index, 'par', e.target.value)}
                                className="text-center mx-auto"
                              />
                            </td>
                            <td style={{ width: '80px' }}>
                              <Form.Control
                                type="number"
                                size="sm"
                                value={hole.index}
                                onChange={(e) => handleHoleChange(index, 'index', e.target.value)}
                                className="text-center mx-auto"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Col>
              ))}
            </Row>
          </Tab>
          <Tab eventKey="tees" title={`Odpaliště (${localTees.length})`}>
            <div className="mt-3 mb-3 text-end">
              <Button variant="success" size="sm" onClick={handleAddTee}>+ Přidat odpaliště</Button>
            </div>
            <Table size="sm" bordered hover>
              <thead>
                <tr>
                  <th>Barva</th>
                  <th>CR</th>
                  <th>SR</th>
                  <th className="text-center">Akce</th>
                </tr>
              </thead>
              <tbody>
                {localTees.map((tee, index) => (
                  <tr key={index}>
                    <td>
                      <Form.Select
                        size="sm"
                        value={tee.color}
                        onChange={(e) => handleTeeChange(index, 'color', e.target.value)}
                      >
                        <option value="">- Vyberte -</option>
                        <option value="white">Bílá</option>
                        <option value="yellow">Žlutá</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        step="0.1"
                        value={tee.CR}
                        onChange={(e) => handleTeeChange(index, 'CR', e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={tee.SR}
                        onChange={(e) => handleTeeChange(index, 'SR', e.target.value)}
                      />
                    </td>
                    <td className="text-center align-middle">
                      <Button variant="danger" size="sm" onClick={() => handleDeleteTee(index)}>Smazat</Button>
                    </td>
                  </tr>
                ))}
                {localTees.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-3">Žádná odpaliště nebyla přidána.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Zrušit</Button>
        <Button variant="primary" onClick={handleSave}>Uložit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CourseModal;
