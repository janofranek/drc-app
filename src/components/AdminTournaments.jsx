import React, { useState } from 'react';
import { Table, Button } from "react-bootstrap";
import { useTournaments } from '../data/TournamentsDataProvider';
import { useUsers } from '../data/UsersDataProvider';
import { useCourses } from '../data/CoursesDataProvider';
import { useMatches } from '../data/MatchesDataProvider';
import { useScorecards } from '../data/ScorecardsDataProvider';
import TournamentModal from './TournamentModal';

const AdminTournaments = () => {
  const tournaments = useTournaments();
  const users = useUsers();
  const courses = useCourses();
  const matches = useMatches();
  const scorecards = useScorecards();

  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (!tournaments || !users || !courses || !matches || !scorecards) return "Loading...";

  // Sort by date (newest first)
  const sortedTournaments = [...tournaments].sort((a, b) => {
    if (a.datestart < b.datestart) return 1;
    if (a.datestart > b.datestart) return -1;
    return 0;
  });

  const handleManage = (tournament) => {
    setSelectedTournament(tournament);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedTournament(null);
    setShowModal(true);
  }

  const handleClose = () => {
    setShowModal(false);
    setSelectedTournament(null);
  };

  const getStatusIcon = (status) => {
    // Default to archive if not specified
    const s = status || 'archive';
    let icon = '❓';
    let title = s;

    switch (s) {
      case 'preparing':
        icon = '🛠️';
        title = 'Připravuje se';
        break;
      case 'actual':
        icon = '✅';
        title = 'Aktuální';
        break;
      case 'archive':
        icon = '🗄️';
        title = 'Archiv';
        break;
      default:
        break;
    }

    return <span title={title} style={{ cursor: 'help', fontSize: '1.2em' }}>{icon}</span>;
  };

  return (
    <>
      <div className='d-flex justify-content-end mb-3'>
        <Button variant="success" onClick={handleCreate}>+ Přidat turnaj</Button>
      </div>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Název</th>
            <th>Datum</th>
            <th>Systém</th>
            <th className="text-center">Stav</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {sortedTournaments.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.info}</td>
              <td>{`${row.datestart.split('-').reverse().join('.')} - ${row.dateend.split('-').reverse().join('.')}`}</td>
              <td>{row.system}</td>
              <td className="text-center">{getStatusIcon(row.status)}</td>
              <td>
                <Button variant="primary" size="sm" onClick={() => handleManage(row)}>Spravovat</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <TournamentModal
        show={showModal}
        onHide={handleClose}
        tournament={selectedTournament}
        users={users}
        courses={courses}
        matches={matches}
        scorecards={scorecards}
        allTournaments={tournaments}
      />
    </>
  );
};

export default AdminTournaments;
