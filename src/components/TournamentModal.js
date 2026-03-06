import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Tab, Row, Col, ListGroup, Form, Accordion, Badge, InputGroup, Table } from 'react-bootstrap';
import { db } from '../cred/firebase';
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getScorecardId, createNewScorecard } from "../utils/Utils.js";

const TournamentModal = ({ show, onHide, tournament, users, courses, matches, scorecards, allTournaments }) => {
  const [selectedTab, setSelectedTab] = useState('players');
  const [localPlayers, setLocalPlayers] = useState([]); // Array of user IDs
  const [localTeams, setLocalTeams] = useState([]); // Array of team objects { name: '', players: [] }
  const [localRounds, setLocalRounds] = useState([]); // Array of round objects
  const [localMatches, setLocalMatches] = useState([]); // Array of RC match objects
  const [localFlights, setLocalFlights] = useState([]); // Array of Stableford flight objects
  const [deletedMatches, setDeletedMatches] = useState([]); // Array of match IDs to delete
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    info: '',
    datestart: '',
    dateend: '',
    system: 'rydercup',
    status: 'preparing',
    active: false
  });

  useEffect(() => {
    if (tournament) {
      setLocalPlayers(tournament.players || []);
      setLocalTeams(tournament.teams || []);
      setLocalPlayers(tournament.players || []);
      setLocalTeams(tournament.teams || []);
      setLocalRounds(tournament.rounds || []);

      // Load Ryder Cup matches (original logic)
      let relevantMatches = [];
      if (matches && tournament.datestart && tournament.dateend) {
        relevantMatches = matches.filter(m => m.date >= tournament.datestart && m.date <= tournament.dateend);
      }
      setLocalMatches(relevantMatches);

      // Load Stableford flights from embedded rounds
      let relevantFlights = [];
      if (tournament.system === 'stableford' && tournament.rounds) {
        tournament.rounds.forEach(r => {
          if (r.flights) {
            r.flights.forEach((f, idx) => {
              const suffix = idx.toString().padStart(2, '0');
              relevantFlights.push({
                id: `${r.date}-f${suffix}`,
                date: r.date,
                type: 'flight',
                players: f.players || []
              });
            });
          }
        });
      }
      setLocalFlights(relevantFlights);
      setDeletedMatches([]);
      setFormData({
        id: tournament.id,
        info: tournament.info || '',
        datestart: tournament.datestart || '',
        dateend: tournament.dateend || '',
        system: tournament.system || 'rydercup',
        status: tournament.status || 'preparing',
        active: tournament.active || false
      });
      setSelectedTab('base');
    } else {
      setLocalPlayers([]);
      setLocalTeams([{ name: 'Standard', players: [] }, { name: 'Latin', players: [] }]);
      setLocalRounds([]);
      setLocalMatches([]);
      setLocalFlights([]);
      setDeletedMatches([]);
      setFormData({
        id: '',
        info: '',
        datestart: '',
        dateend: '',
        system: 'rydercup',
        status: 'preparing',
        active: false
      });
      setSelectedTab('base');
    }
  }, [tournament, matches]);

  const isCreating = !tournament;
  const currentStatus = formData.status;

  // Permissions based on STATUS
  const canEditBase = isCreating || currentStatus === 'preparing';
  const canEditStructure = isCreating || currentStatus === 'preparing'; // Players, Teams
  const canEditRounds = isCreating || currentStatus === 'preparing' || currentStatus === 'actual'; // Rounds configuration and Matches
  const canEditStatus = true; // Always allow changing status (if authorized to edit tournament)

  // --- ROUNDS LOGIC ---
  useEffect(() => {
    if (!formData.datestart || !formData.dateend) {
      if (isCreating) setLocalRounds([]);
      return;
    }
    if (new Date(formData.dateend) < new Date(formData.datestart)) return;
    if (!canEditRounds) return;

    const startDate = new Date(formData.datestart);
    const endDate = new Date(formData.dateend);
    const dates = [];
    let fl = new Date(startDate);
    while (fl <= endDate) {
      dates.push(new Date(fl).toISOString().split('T')[0]);
      fl.setDate(fl.getDate() + 1);
    }

    setLocalRounds(prevRounds => {
      const newRounds = dates.map((date, idx) => {
        const existing = prevRounds.find(r => r.date === date);
        if (existing) return existing;

        if (formData.system === 'rydercup') {
          return { date, holes: 18, name: `Kolo ${idx + 1}`, active: false };
        } else {
          return { date, course: '', active: false };
        }
      });
      return JSON.stringify(newRounds) !== JSON.stringify(prevRounds) ? newRounds : prevRounds;
    });

  }, [formData.datestart, formData.dateend, formData.system, canEditRounds, isCreating]);

  const handleRoundChange = (index, field, value) => {
    // Validation for Ryder Cup Round Active Toggle
    if (formData.system === 'rydercup' && field === 'active') {
      const roundDate = localRounds[index].date;
      const dayMatches = localMatches.filter(m => m.date === roundDate);

      // 1. Activating (value === true)
      if (value === true) {
        // Check players assignment
        const playerCounts = {};
        dayMatches.forEach(m => {
          const allP = [...(m.players_stt || []), ...(m.players_lat || [])];
          allP.forEach(p => {
            if (p) playerCounts[p] = (playerCounts[p] || 0) + 1;
          });
        });

        const unassigned = localPlayers.filter(p => !playerCounts[p]);
        if (unassigned.length > 0) {
          alert(`Nelze aktivovat kolo. Někteří hráči nejsou přiřazeni k žádnému zápasu (${unassigned.length}).`);
          return;
        }

        // 0. Check SEQUENCE (Must be Round 0 OR Previous Round must be Active)
        if (index > 0 && !localRounds[index - 1].active) {
          alert("Nelze aktivovat kolo. Předchozí kolo není aktivní. Aktivace musí probíhat postupně.");
          return;
        }

        // Check that everyone is assigned exactly ONCE
        const multiple = localPlayers.filter(p => playerCounts[p] > 1);
        if (multiple.length > 0) {
          alert(`Nelze aktivovat kolo. Někteří hráči jsou přiřazeni k více zápasům.`);
          return;
        }

        // Check previous day (if exists)
        if (index > 0) {
          const prevDate = localRounds[index - 1].date;
          const prevMatches = localMatches.filter(m => m.date === prevDate);
          const allFinal = prevMatches.every(m => m.final === true);
          if (!allFinal) {
            alert("Nelze aktivovat kolo. Zápasy předchozího dne nejsou uzavřeny (Final).");
            return;
          }
        }
      }

      // 2. Deactivating (value === false)
      if (value === false) {
        const hasPlayed = dayMatches.some(m => m.holes && m.holes.length > 0);
        if (hasPlayed) {
          alert("Nelze deaktivovat kolo, protože již existují rozehrané zápasy.");
          return;
        }
      }
    }
    // Validation for Stableford Round Active Toggle
    if (formData.system === 'stableford' && field === 'active') {
      const roundDate = localRounds[index].date;
      const dayFlights = localFlights.filter(f => f.date === roundDate);

      // 1. Activating
      if (value === true) {
        const roundData = localRounds[index];

        if (!roundData.course) {
          alert('Nelze aktivovat kolo. Není vybráno hřiště pro toto kolo.');
          return;
        }

        // Check players assignment in flights
        const allFlightPlayers = [];
        let missingHcpCount = 0;

        dayFlights.forEach(f => {
          (f.players || []).forEach(p => {
            if (p) {
              allFlightPlayers.push(p);
              const pObj = users.find(u => u.id === p);
              if (pObj && (pObj.hcp === undefined || pObj.hcp === null || pObj.hcp === '')) {
                missingHcpCount++;
              }
            }
          });
        });

        const unassigned = localPlayers.filter(p => !allFlightPlayers.includes(p));
        if (unassigned.length > 0) {
          alert(`Nelze aktivovat kolo. Někteří hráči nejsou zařazeni do žádného flightu (${unassigned.length}).`);
          return;
        }

        if (missingHcpCount > 0) {
          alert(`Nelze aktivovat kolo. ${missingHcpCount} hráčům chybí nastavený HCP a je pro Stableford vyžadován.`);
          return;
        }
      }
    }

    const newRounds = [...localRounds];

    if (field === 'active' && value === true) {
      // Deactivate ALL other rounds
      newRounds.forEach((r, i) => {
        if (i !== index) r.active = false;
      });
      // Activate current
      newRounds[index] = { ...newRounds[index], active: true };
    } else {
      // Standard update (for unchecking active or changing other fields)
      newRounds[index] = { ...newRounds[index], [field]: value };
    }

    setLocalRounds(newRounds);
  };

  // --- PLAYERS LOGIC ---

  const handleAddPlayer = (userId) => {
    if (!localPlayers.includes(userId)) {
      if (formData.system === 'stableford') {
        const playerObj = users.find(u => u.id === userId);
        if (playerObj && (playerObj.hcp === undefined || playerObj.hcp === null || playerObj.hcp === '')) {
          if (!window.confirm(`Hráč ${playerObj.name} nemá zadaný handicap. Ve Stableford turnaji je handicap vyžadován k výpočtům. Chcete jej přesto přidat?`)) {
            return;
          }
        }
      }
      setLocalPlayers([...localPlayers, userId]);
    }
  };

  const handleRemovePlayer = (userId) => {
    // Remove from players list
    setLocalPlayers(localPlayers.filter(id => id !== userId));
    // Also remove from any teams
    setLocalTeams(localTeams.map(team => ({
      ...team,
      players: team.players.filter(pid => pid !== userId)
    })));
  };

  // --- TEAMS LOGIC ---

  const handleAddTeam = () => {
    setLocalTeams([...localTeams, { name: 'Nový tým', players: [] }]);
  };

  const handleDeleteTeam = (index) => {
    const newTeams = [...localTeams];
    newTeams.splice(index, 1);
    setLocalTeams(newTeams);
  };

  const handleTeamNameChange = (index, newName) => {
    const newTeams = [...localTeams];
    newTeams[index].name = newName;
    setLocalTeams(newTeams);
  };

  const handleAddPlayerToTeam = (teamIndex, userId) => {
    if (!userId) return;
    const newTeams = [...localTeams];
    if (!newTeams[teamIndex].players.includes(userId)) {
      newTeams[teamIndex].players.push(userId);
      setLocalTeams(newTeams);
    }
  };

  const handleRemovePlayerFromTeam = (teamIndex, userId) => {
    const newTeams = [...localTeams];
    newTeams[teamIndex].players = newTeams[teamIndex].players.filter(id => id !== userId);
    setLocalTeams(newTeams);
  };

  // --- MATCHES LOGIC ---
  const handleAddMatch = (roundDate) => {
    // Generate ID: YYYY-MM-DD-xx
    // Find matches for this day across ALL matches (including local additions)
    // Actually we need to check DB matches + local matches to ensure uniqueness if concurrent edits?
    // For now, let's rely on local + matches prop to find max suffix.
    // But wait, matches prop is all matches.

    const dayMatches = [...(matches || []), ...localMatches].filter(m => m.date === roundDate);

    // Extract suffixes
    let maxSuffix = -1;
    dayMatches.forEach(m => {
      const parts = m.id.split('-');
      if (parts.length >= 4) {
        const suffix = parseInt(parts[3] || parts[parts.length - 1]); // Handle YYYY-MM-DD-xx
        if (!isNaN(suffix) && suffix > maxSuffix) maxSuffix = suffix;
      }
    });

    const newSuffix = (maxSuffix + 1).toString().padStart(2, '0');
    const newId = `${roundDate}-${newSuffix}`;

    // Check if ID exists (just in case)
    if (localMatches.some(m => m.id === newId)) {
      alert("Error generating match ID, please try again.");
      return;
    }

    const newMatch = {
      id: newId,
      date: roundDate,
      players_stt: [],
      players_lat: [],
      final: false,
      final_score: 0,
      holes: [],
      result: ""
    };

    setLocalMatches([...localMatches, newMatch]);
  };

  // --- FLIGHTS LOGIC (Stableford) ---
  const handleAddFlight = (roundDate) => {
    let maxSuffix = -1;
    localFlights.filter(f => f.date === roundDate).forEach(f => {
      const parts = f.id.split('-');
      if (parts.length >= 4) {
        const lastPart = parts[parts.length - 1]; // e.g. 'f00', 'f01'
        const suffixStr = lastPart.startsWith('f') ? lastPart.substring(1) : lastPart;
        const suffix = parseInt(suffixStr);
        if (!isNaN(suffix) && suffix > maxSuffix) maxSuffix = suffix;
      }
    });

    const newSuffix = (maxSuffix + 1).toString().padStart(2, '0');
    const newId = `${roundDate}-f${newSuffix}`;

    const newFlight = {
      id: newId,
      date: roundDate,
      type: 'flight',
      players: []
    };

    setLocalFlights([...localFlights, newFlight]);
  };

  const handleDeleteFlight = (flightId) => {
    setLocalFlights(localFlights.filter(f => f.id !== flightId));
  };

  const handleFlightPlayerChange = (flightId, playerIndex, playerId) => {
    setLocalFlights(localFlights.map(f => {
      if (f.id !== flightId) return f;

      const newFlight = { ...f };
      const targetArray = newFlight.players ? [...newFlight.players] : [];

      if (playerId === "") {
        targetArray[playerIndex] = "";
      } else {
        targetArray[playerIndex] = playerId;
      }

      newFlight.players = targetArray;
      return newFlight;
    }));
  };

  const handleDeleteMatch = (matchId) => {
    // Check if it's existing match (in Firestore)
    const isExisting = matches && matches.find(m => m.id === matchId);
    if (isExisting) {
      setDeletedMatches([...deletedMatches, matchId]);
    }
    setLocalMatches(localMatches.filter(m => m.id !== matchId));
  };

  const handleMatchPlayerChange = (matchId, team, playerIndex, playerId) => {
    setLocalMatches(localMatches.map(m => {
      if (m.id !== matchId) return m;

      const newMatch = { ...m };
      const targetArray = team === 'stt' ? [...newMatch.players_stt] : [...newMatch.players_lat];

      if (playerId === "") {
        // Remove
        targetArray.splice(playerIndex, 1);
      } else {
        // Update or Add
        if (playerIndex < targetArray.length) {
          targetArray[playerIndex] = playerId;
        } else {
          targetArray.push(playerId);
        }
      }

      if (team === 'stt') newMatch.players_stt = targetArray;
      else newMatch.players_lat = targetArray;

      return newMatch;
    }));
  };

  const handleSave = async () => {
    if (formData.datestart && formData.dateend && formData.dateend < formData.datestart) {
      alert("Datum do nesmí být před datem od!");
      return;
    }

    try {
      // 1. Process Flights into Rounds (for Stableford)
      const roundsToSave = localRounds.map(r => {
        if (formData.system === 'stableford') {
          const roundFlights = localFlights
            .filter(f => f.date === r.date)
            .map(f => ({ players: f.players || [] }));
          return { ...r, flights: roundFlights };
        }
        return r;
      });

      // 2. Save Tournament
      if (isCreating) {
        const tournamentRef = doc(db, "tournaments", formData.id);
        await setDoc(tournamentRef, {
          ...formData,
          players: localPlayers,
          teams: localTeams,
          rounds: roundsToSave,
          active: false
        });
      } else {
        const tournamentRef = doc(db, "tournaments", tournament.id);
        await updateDoc(tournamentRef, {
          ...formData,
          players: localPlayers,
          teams: localTeams,
          rounds: roundsToSave
        });
      }

      // 3. Save Matches (RC only - localMatches never contains flights now)
      for (const match of localMatches) {
        const matchRef = doc(db, "matches", match.id);
        await setDoc(matchRef, match, { merge: true });
      }

      // 4. Delete Matches
      for (const matchId of deletedMatches) {
        await deleteDoc(doc(db, "matches", matchId));
      }

      // 5. Stableford Scorecards Generation
      if (formData.system === 'stableford') {
        const activeRounds = localRounds.filter(r => r.active);
        for (const round of activeRounds) {
          if (!round.course) continue;
          const courseObj = courses.find(c => c.id === round.course);
          if (!courseObj) continue;

          const roundFlights = localFlights.filter(f => f.date === round.date);
          const allPlayersInRound = roundFlights.flatMap(f => f.players || []).filter(Boolean);

          await Promise.all(allPlayersInRound.map(async playerId => {
            const initScorecardId = getScorecardId(round.date, playerId);
            const playerUser = users.find(u => u.id === playerId);
            if (playerUser) {
              await createNewScorecard(initScorecardId, playerUser, courseObj, round.date);
            }
          }));
        }
      }

      onHide();
    } catch (error) {
      console.error("Error updating tournament:", error);
      alert("Nepodařilo se uložit změny: " + error.message);
    }
  };

  const validateTournamentActivation = () => {
    // 0. Check if any OTHER tournament is already active
    const otherActive = allTournaments && allTournaments.some(t => t.active === true && t.id !== formData.id);
    if (otherActive) {
      alert('Již existuje jiný aktivní turnaj. Pro aktivaci tohoto turnaje musíte nejprve ukončit (archivovat) nebo deaktivovat ten současný.');
      return false;
    }

    // 2. Check that there are some players chosen
    if (localPlayers.length === 0) {
      alert('Nelze aktivovat turnaj bez hráčů.');
      return false;
    }

    // System-specific validation
    if (formData.system === 'rydercup') {
      const team1 = localTeams[0]?.players || [];
      const team2 = localTeams[1]?.players || [];

      if (team1.length !== team2.length) {
        alert(`Týmy musí mít stejný počet hráčů (Standard: ${team1.length}, Latin: ${team2.length}).`);
        return false;
      }

      const allAssignedPlayers = [...team1, ...team2];
      const uniqueAssignedPlayers = new Set(allAssignedPlayers);

      if (uniqueAssignedPlayers.size !== allAssignedPlayers.length) {
        alert('Chyba: Některý hráč je přiřazen ve více týmech.');
        return false;
      }

      const unassignedPlayers = localPlayers.filter(p => !uniqueAssignedPlayers.has(p));
      if (unassignedPlayers.length > 0) {
        alert(`Všichni hráči musí být v týmu. Nepřiřazení hráči: ${unassignedPlayers.length}`);
        return false;
      }
    } else if (formData.system === 'stableford') {
      const allAssignedPlayers = localTeams.flatMap(t => t.players || []);
      const uniqueAssignedPlayers = new Set(allAssignedPlayers);

      if (uniqueAssignedPlayers.size !== allAssignedPlayers.length) {
        alert('Chyba: Některý hráč je přiřazen ve více týmech.');
        return false;
      }

      const unassignedPlayers = localPlayers.filter(p => !uniqueAssignedPlayers.has(p));
      if (unassignedPlayers.length > 0) {
        alert(`Všichni hráči musí být v týmu. Nepřiřazení hráči: ${unassignedPlayers.length}`);
        return false;
      }
    }

    // 5. Check round count
    if (formData.datestart && formData.dateend) {
      const start = new Date(formData.datestart);
      const end = new Date(formData.dateend);
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (localRounds.length !== diffDays) {
        alert(`Počet kol (${localRounds.length}) neodpovídá počtu dní turnaje (${diffDays}).`);
        return false;
      }
    }

    return true;
  };

  const validateRyderCupDeactivation = (nextStatus) => {
    const tournamentMatches = localMatches.filter(m => m.date >= formData.datestart && m.date <= formData.dateend);

    if (nextStatus === 'preparing') {
      const hasPlayedMatch = tournamentMatches.some(m => m.holes && m.holes.length > 0);
      if (hasPlayedMatch) {
        alert("Nelze vrátit do přípravy, protože již existují rozehrané zápasy.");
        return false;
      }
    }

    if (nextStatus === 'archive') {
      const start = new Date(formData.datestart);
      const end = new Date(formData.dateend);
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

      const uniqueDays = new Set(tournamentMatches.map(m => m.date));
      if (uniqueDays.size < diffDays) {
        alert("Nelze archivovat. Pro některé dny turnaje chybí zápasy.");
        return false;
      }

      const allFinalized = tournamentMatches.every(m => m.final === true);
      if (!allFinalized) {
        alert("Nelze archivovat. Všechny zápasy musí být uzavřeny (Final).");
        return false;
      }
    }

    return true;
  };

  const validateStablefordDeactivation = (nextStatus) => {
    // Get all dates for this tournament
    const start = new Date(formData.datestart);
    const end = new Date(formData.dateend);
    const dates = [];
    let fl = new Date(start);
    while (fl <= end) {
      dates.push(new Date(fl).toISOString().split('T')[0]);
      fl.setDate(fl.getDate() + 1);
    }

    // Filter scorecards related to this tournament (by player and date)
    const tournamentScorecards = scorecards ? scorecards.filter(sc => {
      return dates.includes(sc.date) && localPlayers.includes(sc.player);
    }) : [];

    if (nextStatus === 'preparing') {
      const hasScores = tournamentScorecards.some(sc =>
        sc.holes && sc.holes.some(h => (h.score !== 0 && h.score !== null && h.score !== undefined))
      );
      if (hasScores) {
        alert("Nelze vrátit do přípravy, protože již existují zadané výsledky ve skórkartách.");
        return false;
      }
    }

    if (nextStatus === 'archive') {
      const uniqueDaysWithScorecards = new Set(tournamentScorecards.map(sc => sc.id.split(' ')[0]));

      if (uniqueDaysWithScorecards.size < dates.length) {
        alert("Nelze archivovat. Pro některé dny turnaje chybí skórkarty.");
        return false;
      }
    }

    return true;
  };

  const validateStatusChange = (currentStatus, nextStatus) => {
    if (currentStatus === nextStatus) return true;

    if (currentStatus === 'preparing') {
      if (nextStatus === 'archive') {
        alert('Turnaj nelze přepnout z přípravy přímo do archivu. Musí být nejprve aktivní.');
        return false;
      }
      if (nextStatus === 'actual') return validateTournamentActivation();
    }

    if (currentStatus === 'actual') {
      if (formData.system === 'rydercup') return validateRyderCupDeactivation(nextStatus);
      if (formData.system === 'stableford') return validateStablefordDeactivation(nextStatus);
    }

    if (currentStatus === 'archive') {
      if (nextStatus !== 'actual') {
        alert('Z archivu lze turnaj vrátit pouze do stavu Aktuální.');
        return false;
      }
    }

    return true;
  };

  const applyStatusSideEffects = (currentStatus, nextStatus) => {
    if (nextStatus === 'archive') {
      const deactivatedRounds = localRounds.map(r => ({ ...r, active: false }));
      setLocalRounds(deactivatedRounds);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'status') {
      if (!validateStatusChange(formData.status, value)) return;
      applyStatusSideEffects(formData.status, value);

      const isActive = (value === 'actual');
      setFormData(prev => ({ ...prev, [name]: value, active: isActive }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'system' && isCreating) {
      if (value === 'rydercup') {
        setLocalTeams([{ name: 'Standard', players: [] }, { name: 'Latin', players: [] }]);
      } else {
        setLocalTeams([]);
      }
    }
  };

  // Filter available users (those not yet in localPlayers)
  const availableUsers = users ? users.filter(u => !localPlayers.includes(u.id)) : [];
  // Search filter
  const filteredAvailableUsers = availableUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));

  // Get user objects for localPlayers IDs
  const tournamentPlayerObjects = localPlayers.map(id => users.find(u => u.id === id)).filter(Boolean).sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Správa turnaje: {tournament?.info}</Modal.Title>
      </Modal.Header>
      <Modal.Body>


        <Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} className="mb-3">
          <Tab eventKey="base" title="Základní údaje">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ID turnaje (unikátní)</Form.Label>
                <Form.Control
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  disabled={!isCreating}
                  placeholder="napr. 2025-rydercup"
                />

              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Název</Form.Label>
                <Form.Control
                  type="text"
                  name="info"
                  value={formData.info}
                  onChange={handleInputChange}
                  disabled={!canEditBase}
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Datum od</Form.Label>
                    {canEditBase ? (
                      <Form.Control
                        type="date"
                        name="datestart"
                        value={formData.datestart}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Form.Control
                        type="text"
                        value={formData.datestart ? formData.datestart.split('-').reverse().join('.') : ''}
                        disabled
                      />
                    )}
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Datum do</Form.Label>
                    {canEditBase ? (
                      <Form.Control
                        type="date"
                        name="dateend"
                        value={formData.dateend}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <Form.Control
                        type="text"
                        value={formData.dateend ? formData.dateend.split('-').reverse().join('.') : ''}
                        disabled
                      />
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Systém</Form.Label>
                <Form.Select
                  name="system"
                  value={formData.system}
                  onChange={handleInputChange}
                  disabled={!canEditBase}
                >
                  <option value="rydercup">Ryder Cup</option>
                  <option value="stableford">Stableford</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Stav</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={!canEditStatus}
                >
                  <option value="preparing">Připravuje se</option>
                  <option value="actual">Aktuální</option>
                  <option value="archive">Archiv</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Tab>
          <Tab eventKey="players" title={`Hráči (${localPlayers.length})`}>
            <Row>
              {canEditStructure && (
                <Col md={6}>
                  <h5>Dostupní uživatelé</h5>
                  <Form.Control
                    type="text"
                    placeholder="Hledat..."
                    className="mb-2"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                    <ListGroup variant="flush">
                      {filteredAvailableUsers.map(user => (
                        <ListGroup.Item key={user.id} action onClick={() => canEditStructure && handleAddPlayer(user.id)} disabled={!canEditStructure}>
                          {user.name} <span className="text-muted small">({user.short})</span>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                </Col>
              )}
              <Col md={canEditStructure ? 6 : 12}>
                <h5>Hráči v turnaji</h5>
                <div style={{ maxHeight: '440px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                  <ListGroup variant="flush">
                    {tournamentPlayerObjects.map(user => (
                      <ListGroup.Item key={user.id} className="d-flex justify-content-between align-items-center">
                        <span>{user.name}</span>
                        {canEditStructure &&
                          <Button variant="outline-danger" size="sm" onClick={() => handleRemovePlayer(user.id)}>
                            &times;
                          </Button>
                        }
                      </ListGroup.Item>
                    ))}
                    {tournamentPlayerObjects.length === 0 && <div className="p-3 text-muted">Žádní hráči</div>}
                  </ListGroup>
                </div>
              </Col>
            </Row>
          </Tab>
          <Tab eventKey="teams" title={`Týmy (${localTeams.length})`}>
            {canEditStructure && <Button variant="success" size="sm" className="mb-3" onClick={handleAddTeam}>+ Přidat tým</Button>}

            <Accordion defaultActiveKey="0">
              {localTeams.map((team, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>{team.name} <Badge bg="secondary" className="ms-2">{team.players.length}</Badge></Accordion.Header>
                  <Accordion.Body>
                    <Row className="mb-3">
                      <Col>
                        <Form.Label>Název týmu</Form.Label>
                        <div className="d-flex">
                          <Form.Control
                            type="text"
                            value={team.name}
                            onChange={(e) => handleTeamNameChange(index, e.target.value)}
                            disabled={!canEditStructure}
                          />
                          {canEditStructure &&
                            <Button variant="danger" className="ms-2" onClick={() => handleDeleteTeam(index)}>Smazat</Button>
                          }
                        </div>
                      </Col>
                    </Row>

                    <h6>Členové týmu:</h6>
                    <ListGroup className="mb-3">
                      {[...team.players].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })).map(pid => {
                        const pObj = users.find(u => u.id === pid);
                        return (
                          <ListGroup.Item key={pid} className="d-flex justify-content-between align-items-center py-1">
                            {pObj ? pObj.name : pid}
                            {canEditStructure &&
                              <Button variant="link" className="text-danger p-0" onClick={() => handleRemovePlayerFromTeam(index, pid)}>Odebrat</Button>
                            }
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>

                    {canEditStructure && (
                      <InputGroup size="sm">
                        <Form.Select
                          id={`team-add-${index}`}
                          onChange={(e) => {
                            handleAddPlayerToTeam(index, e.target.value);
                            e.target.value = ""; // reset
                          }}
                        >
                          <option value="">+ Přidat člena...</option>
                          {tournamentPlayerObjects
                            .filter(p => {
                              // Check if player is already in ANY team
                              const isAssigned = localTeams.some(t => t.players.includes(p.id));
                              return !isAssigned;
                            })
                            .map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))
                          }
                        </Form.Select>
                      </InputGroup>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Tab>
          <Tab eventKey="rounds_rc" title={`Kola - Ryder Cup (${localRounds.length})`} disabled={formData.system !== 'rydercup'}>
            <Accordion>
              {localRounds.map((round, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>
                    {round.date.split('-').reverse().join('.')}
                    {round.name && ` - ${round.name}`}
                    {round.active ? ' (Aktivní)' : ''}
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Label>Název kola</Form.Label>
                        <Form.Control
                          type="text"
                          value={round.name || ''}
                          onChange={(e) => handleRoundChange(index, 'name', e.target.value)}
                          disabled={!canEditRounds}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label>Počet jamek</Form.Label>
                        <Form.Select
                          value={round.holes}
                          onChange={(e) => handleRoundChange(index, 'holes', parseInt(e.target.value))}
                          disabled={!canEditRounds}
                        >
                          <option value={9}>9</option>
                          <option value={18}>18</option>
                          <option value={27}>27</option>
                        </Form.Select>
                      </Col>
                      <Col md={3}>
                        <Form.Label>Aktivní</Form.Label>
                        <Form.Check
                          type="switch"
                          checked={!!round.active}
                          onChange={(e) => handleRoundChange(index, 'active', e.target.checked)}
                          disabled={!canEditRounds}
                        />
                      </Col>
                    </Row>

                    <h6 className="mt-4">Zápasy</h6>

                    <div className="mt-2">
                      {localMatches.filter(m => m.date === round.date && m.type !== 'flight').sort((a, b) => a.id.localeCompare(b.id)).map(match => (
                        <div key={match.id} className="border p-2 mb-2 rounded bg-light">
                          <div className="d-flex justify-content-between mb-1">
                            <strong>ID: {match.id}</strong>
                            {canEditRounds && <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteMatch(match.id)}>Smazat</Button>}
                          </div>
                          <Row>
                            <Col md={5}>
                              <span className="text-primary fw-bold">{localTeams[0] ? localTeams[0].name : 'Tým 1'}</span>
                              {[0, 1].map(i => (
                                <Form.Select
                                  key={i}
                                  size="sm"
                                  className="mb-1"
                                  value={(match.players_stt && match.players_stt[i]) || ""}
                                  onChange={(e) => handleMatchPlayerChange(match.id, 'stt', i, e.target.value)}
                                  disabled={!canEditRounds}
                                >
                                  <option value="">-- Hráč --</option>
                                  {(localTeams[0]?.players || []).slice().sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })).map(pid => {
                                    const pObj = users.find(u => u.id === pid);
                                    // Check if used in this round
                                    const usedInRound = [];
                                    localMatches.forEach(m => {
                                      if (m.date === round.date && m.type !== 'flight') {
                                        if (m.players_stt) usedInRound.push(...m.players_stt);
                                        if (m.players_lat) usedInRound.push(...m.players_lat);
                                      }
                                    });
                                    const isUsed = usedInRound.includes(pid);
                                    const isSelectedHere = match.players_stt && match.players_stt[i] === pid;

                                    if (isUsed && !isSelectedHere) return null;

                                    return <option key={pid} value={pid}>{pObj ? pObj.name : pid}</option>;
                                  })}
                                </Form.Select>
                              ))}
                            </Col>
                            <Col md={2} className="text-center align-self-center">
                              VS
                            </Col>
                            <Col md={5}>
                              <span className="text-danger fw-bold">{localTeams[1] ? localTeams[1].name : 'Tým 2'}</span>
                              {[0, 1].map(i => (
                                <Form.Select
                                  key={i}
                                  size="sm"
                                  className="mb-1"
                                  value={(match.players_lat && match.players_lat[i]) || ""}
                                  onChange={(e) => handleMatchPlayerChange(match.id, 'lat', i, e.target.value)}
                                  disabled={!canEditRounds}
                                >
                                  <option value="">-- Hráč --</option>
                                  {(localTeams[1]?.players || []).slice().sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })).map(pid => {
                                    const pObj = users.find(u => u.id === pid);
                                    // Check if used in this round
                                    const usedInRound = [];
                                    localMatches.forEach(m => {
                                      if (m.date === round.date && m.type !== 'flight') {
                                        if (m.players_stt) usedInRound.push(...m.players_stt);
                                        if (m.players_lat) usedInRound.push(...m.players_lat);
                                      }
                                    });
                                    const isUsed = usedInRound.includes(pid);
                                    const isSelectedHere = match.players_lat && match.players_lat[i] === pid;

                                    if (isUsed && !isSelectedHere) return null;

                                    return <option key={pid} value={pid}>{pObj ? pObj.name : pid}</option>;
                                  })}
                                </Form.Select>
                              ))}
                            </Col>
                          </Row>
                        </div>
                      ))}
                      {localMatches.filter(m => m.date === round.date && m.type !== 'flight').length === 0 && <div className="text-muted small">Žádné zápasy.</div>}
                    </div>

                    {canEditRounds && <Button variant="success" size="sm" className="mt-3" onClick={() => handleAddMatch(round.date)}>+ Přidat zápas</Button>}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Tab>

          <Tab eventKey="rounds_st" title={`Kola - Stableford (${localRounds.length})`} disabled={formData.system !== 'stableford'}>
            <Accordion>
              {localRounds.map((round, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>
                    {round.date.split('-').reverse().join('.')}
                    {round.course ? ` - Course ID: ${round.course}` : ''}
                    {round.active ? ' (Aktivní)' : ''}
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Label>Hřiště</Form.Label>
                        <Form.Select
                          value={round.course || ''}
                          onChange={(e) => handleRoundChange(index, 'course', e.target.value)}
                          disabled={!canEditRounds}
                        >
                          <option value="">Vyberte hřiště...</option>
                          {courses && courses.map(c => (
                            <option key={c.id} value={c.id}>{c.resort} - {c.course}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={3}>
                        <Form.Label>Aktivní</Form.Label>
                        <Form.Check
                          type="switch"
                          checked={!!round.active}
                          onChange={(e) => handleRoundChange(index, 'active', e.target.checked)}
                          disabled={!canEditRounds}
                        />
                      </Col>
                    </Row>

                    <h6 className="mt-4">Flighty (skupiny po až 4 hráčích)</h6>
                    <div className="mt-2">
                      {localFlights.filter(f => f.date === round.date).sort((a, b) => a.id.localeCompare(b.id)).map((flight, idx) => (
                        <div key={flight.id} className="border p-2 mb-2 rounded bg-light">
                          <div className="d-flex justify-content-between mb-1">
                            <strong>Skupina {idx + 1}</strong>
                            {canEditRounds && <Button variant="link" className="text-danger p-0" onClick={() => handleDeleteFlight(flight.id)}>Smazat</Button>}
                          </div>
                          <Row>
                            {[0, 1, 2, 3].map(i => (
                              <Col md={3} key={i}>
                                <Form.Select
                                  size="sm"
                                  className="mb-1"
                                  value={(flight.players && flight.players[i]) || ""}
                                  onChange={(e) => handleFlightPlayerChange(flight.id, i, e.target.value)}
                                  disabled={!canEditRounds}
                                >
                                  <option value="">-- Hráč --</option>
                                  {tournamentPlayerObjects
                                    .slice().sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }))
                                    .map(p => {
                                      // Check if used in this round anywhere else
                                      const usedInRound = localFlights
                                        .filter(f => f.date === round.date)
                                        .flatMap(f => f.players || []);
                                      const isUsed = usedInRound.includes(p.id);
                                      const isSelectedHere = (flight.players && flight.players[i]) === p.id;

                                      if (isUsed && !isSelectedHere) return null;

                                      return <option key={p.id} value={p.id}>{p.name} ({p.hcp || 'No HCP'})</option>;
                                    })}
                                </Form.Select>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      ))}
                      {localFlights.filter(f => f.date === round.date).length === 0 && <div className="text-muted small">Žádné flighty.</div>}
                    </div>

                    {canEditRounds && <Button variant="success" size="sm" className="mt-3" onClick={() => handleAddFlight(round.date)}>+ Přidat Flight</Button>}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Zavřít</Button>
        {(canEditBase || canEditStatus || canEditRounds) && <Button variant="primary" onClick={handleSave}>Uložit změny</Button>}
      </Modal.Footer>
    </Modal >
  );
};

export default TournamentModal;
