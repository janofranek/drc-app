import React, { useState } from 'react';
import { Table, Button } from "react-bootstrap";
import { useCourses } from '../data/CoursesDataProvider';
import CourseModal from './CourseModal';

const AdminCourses = () => {
  const courses = useCourses();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (!courses) return "Loading...";

  const sortedCourses = [...courses].sort((a, b) => {
    return a.resort.localeCompare(b.resort) || a.course.localeCompare(b.course);
  });

  const handleManage = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  return (
    <>
      <div className='d-flex justify-content-end mb-3'>
        <Button variant="success" onClick={handleCreate}>+ Přidat hřiště</Button>
      </div>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Resort</th>
            <th>Hřiště</th>
            <th>Par</th>
            <th>Odpaliště</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {sortedCourses.map((row) => (
            <tr key={row.id}>
              <td className="align-middle">{row.id}</td>
              <td className="align-middle">{row.resort}</td>
              <td className="align-middle">{row.course}</td>
              <td className="align-middle">{row.par}</td>
              <td className="align-middle">{row.tees?.length || 0}</td>
              <td>
                <Button variant="primary" size="sm" onClick={() => handleManage(row)}>Spravovat</Button>
              </td>
            </tr>
          ))}
          {sortedCourses.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted">Zatím nebylo vytvořeno žádné hřiště.</td>
            </tr>
          )}
        </tbody>
      </Table>

      <CourseModal
        show={showModal}
        onHide={handleClose}
        course={selectedCourse}
      />
    </>
  );
};

export default AdminCourses;
