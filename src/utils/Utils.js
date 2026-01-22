import { db, auth } from '../cred/firebase';
import { doc, getDoc, updateDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";

const checkUserAdmin = (authEmail, users) => {
  if (!authEmail || !users) {
    return false
  } else {
    return users.filter(user => user.email.toLowerCase() === authEmail.toLowerCase() && user.admin).length > 0
  }
}
const getScorecardId = (date, playerId) => {
  return date + " " + playerId;
}
const getPlayingHCP = (player, course, tee = null) => {
  const teeColor = tee ?? player.tee
  let teeBox = course.tees.filter(tee => tee.color === teeColor)[0]
  return Math.round(player.hcp * (teeBox.SR / 113) + (teeBox.CR - course.par))
}

const getHoleShots = (holeIndex, playingHcp) => {

  if (playingHcp >= 36) {
    return (holeIndex + 36 > playingHcp ? 2 : 3)
  } else if (playingHcp >= 18) {
    return (holeIndex + 18 > playingHcp ? 1 : 2)
  } else if (playingHcp >= 0) {
    return (holeIndex > playingHcp ? 0 : 1)
  } else {
    return (holeIndex - 18 > playingHcp ? -1 : 0)
  }
}

const getHolesHCP = (player, course) => {
  const playingHcp = getPlayingHCP(player, course)
  return course.holes.map((hole) => getHoleShots(hole.index, playingHcp))
}

const getStableford2 = (score, par, shots) => {
  if (score === 0) {
    return 0
  } else if (score < par + shots + 2) {
    return par + shots + 2 - score
  } else {
    return 0
  }
}

const getStableford = (hole) => {
  return getStableford2(hole.score, hole.par, hole.shots)
}

const setHoleScore = async (scorecardId, holeNumber, newScore) => {
  const scorecardRef = doc(db, "scorecards", scorecardId);
  const scorecardSnap = await getDoc(scorecardRef);
  let newHoles = [...scorecardSnap.data().holes]
  newHoles[holeNumber - 1].score = Number(newScore)
  newHoles[holeNumber - 1].stableford = getStableford(newHoles[holeNumber - 1])
  await updateDoc(scorecardRef, { holes: newHoles });
}

const createNewScorecard = async (scorecardId, player, course, force = false) => {
  const docSnap = await getDoc(doc(db, 'scorecards', scorecardId));
  //insert only if the scorecard does not already exist
  if (!docSnap.exists() || force) {
    const playingHCP = getPlayingHCP(player, course);
    const newScorecard = {
      "course": course.id,
      "player": player.id,
      "tee": player.tee,
      "playingHCP": playingHCP,
      "holes": []
    }
    course.holes.forEach(hole => {
      newScorecard.holes.push(
        {
          "hole": hole.hole,
          "par": hole.par,
          "shots": getHoleShots(hole.index, playingHCP),
          "score": 0,
          "stableford": 0
        }
      )
    })
    await setDoc(doc(db, 'scorecards', scorecardId), newScorecard);
  }
}

const resetScorecard = async (scorecardId, player, course, tee = null) => {
  const teeColor = tee ?? player.tee
  const scorecardRef = doc(db, "scorecards", scorecardId);
  const docSnap = await getDoc(scorecardRef);
  //update only if the scorecard does already exist
  if (docSnap.exists()) {
    const playingHCP = getPlayingHCP(player, course, teeColor);
    const updateScorecard = {
      "tee": teeColor,
      "playingHCP": playingHCP,
      "holes": []
    }
    docSnap.data().holes.forEach((hole, index) => {
      const shots = getHoleShots(course.holes[index].index, playingHCP)
      const stbl = getStableford2(hole.score, hole.par, shots)
      updateScorecard.holes.push(
        {
          "hole": hole.hole,
          "par": hole.par,
          "shots": shots,
          "score": hole.score,
          "stableford": stbl
        }
      )
    })
    await updateDoc(scorecardRef, updateScorecard);
  }
}

const getRoundScore = (player, date, scorecards) => {
  const scorecardId = date + " " + player
  const scorecard = scorecards.filter(sc => sc.id === scorecardId)
  if (scorecard.length === 0) {
    return [0, 0]
  } else {
    return [
      scorecard[0].holes.reduce((a, v) => a = a + v.score, 0),
      scorecard[0].holes.reduce((a, v) => a = a + v.stableford, 0),
    ]
  }
}

const getTeamRoundScore = (team, date, resultsTable) => {
  let roundStbl = [];
  team.players.forEach(player => {
    const playerRow = resultsTable.filter(r => r.player === player)[0]
    roundStbl.push(playerRow[date + "_stbl"])
  })
  roundStbl.sort((a, b) => b - a)
  //take two out of three scores
  return roundStbl[0] + roundStbl[1]
}

const getFlight = (currentUser, currentRound) => {
  return currentRound.flights.filter(flight => flight.players.includes(currentUser.id))[0]?.players
}

const getRyderHoleClass = (score) => {
  const holeClass = "ryder-score-match";
  const scoreMap = new Map([
    [-1, " stt-final"],
    [0, " square-final"],
    [1, " lat-final"]
  ]);

  return holeClass + (scoreMap.get(score) ?? "");
}

const getRyderMatchScore = (match) => {
  return match.holes.reduce((a, v) => a += v, 0);
}

const getRyderMatchClass = (match, small = false) => {
  const score = getRyderMatchScore(match);
  let matchClass = "ryder-score-total";
  matchClass += (small ? "-small" : "")
  if (score < 0) {
    matchClass += " stt-";
  } else if (score > 0) {
    matchClass += " lat-";
  } else {
    matchClass += " square-";
  }
  matchClass += (match.final ? "final" : "prelim")
  return matchClass;
}

const getRyderMatchText = (match) => {
  const score = getRyderMatchScore(match);
  if (match.final) {
    return match.result
  } else if (score) {
    return Math.abs(score) + " up"
  } else {
    return "0"
  }
}

const getRyderHoleScore = (buttonId) => {
  const buttonMap = new Map([
    ["stt", -1],
    ["rem", 0],
    ["lat", 1],
    ["neh", null],
  ]);
  return buttonMap.get(buttonId)
}

const setMatchScore = async (matchId, holeNumber, newScore, totalHolesCount) => {
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);
  let updateData = {};
  let newHoles = [...matchSnap.data().holes]
  if (newScore === null) {
    newHoles.pop();
  } else {
    newHoles[holeNumber - 1] = Number(newScore);
  }
  updateData["holes"] = newHoles;
  // detect, if the match is finished
  const matchScore = newHoles.reduce((a, v) => a += (v ?? 0), 0);
  const holesToPlay = totalHolesCount - newHoles.filter(h => !(h == null)).length;
  // last hole
  if (holesToPlay === 0) {
    updateData["final"] = true;
    updateData["final_score"] = Math.sign(matchScore);
    updateData["result"] = (matchScore === 0 ? "square" : Math.abs(matchScore).toString() + " up")
    // score is higher than number of holes to play
  } else if (Math.abs(matchScore) > holesToPlay) {
    updateData["final"] = true;
    updateData["final_score"] = Math.sign(matchScore);
    updateData["result"] = Math.abs(matchScore).toString() + "&" + holesToPlay.toString();
    // if the match was finished, but after score change it is not
  } else if (matchSnap.data().final && holesToPlay > 0 && Math.abs(matchScore) <= holesToPlay) {
    updateData["final"] = false;
    updateData["final_score"] = 0;
    updateData["result"] = "";
  }
  await updateDoc(matchRef, updateData);
}

const formatRyderStatus = (score) => {
  const halfSymbol = "\u00bd";
  const tolerance = 0.01;
  const wholePart = Math.floor(score);
  const hasHalf = (Math.abs(score - wholePart - 0.5) < tolerance);
  if (wholePart === 0 && hasHalf) {
    return halfSymbol;
  } else if (hasHalf) {
    return wholePart.toString() + " " + halfSymbol;
  } else {
    return wholePart.toString();
  }

}

const getLastRyderMatch = (allTournaments) => {

  const tournaments = allTournaments.filter(t => (t.system === "rydercup" && t.status !== "preparing"))

  if (tournaments.length === 0) return null;

  let lastStartDate = tournaments[0].datestart

  for (let i = 1; i < tournaments.length; i++) {
    if (tournaments[i].datestart > lastStartDate) {
      lastStartDate = tournaments[i].datestart;
    }
  }

  return tournaments.filter(t => (t.datestart === lastStartDate))[0]
}

const getRyderStandings = (allMatches, datestart, dateend) => {

  const matches = allMatches.filter(m => (m.id.substring(0, 10) >= datestart && m.id.substring(0, 10) <= dateend))

  const sttFinal = matches
    .filter(m => m.final && m.final_score <= 0)
    .reduce((a, v) => a = a + (v.final_score < 0 ? 1.0 : 0.5), 0.0)
  const latFinal = matches
    .filter(m => m.final && m.final_score >= 0)
    .reduce((a, v) => a = a + (v.final_score > 0 ? 1.0 : 0.5), 0.0)
  const liveMatches = matches.filter(m => !m.final && m.holes.length > 0 && m.holes.some((h) => h !== null))
  let sttPrelim = sttFinal;
  let latPrelim = latFinal;
  for (const m of liveMatches) {
    const liveScore = m.holes.reduce((a, v) => a += (v ?? 0), 0)
    if (liveScore < 0) {
      sttPrelim += 1.0;
    } else if (liveScore > 0) {
      latPrelim += 1.0;
    } else {
      sttPrelim += 0.5;
      latPrelim += 0.5;
    }
  }

  return {
    "sttFinal": sttFinal,
    "latFinal": latFinal,
    "sttPrelim": sttPrelim,
    "latPrelim": latPrelim
  }
}


const createUser = async (userData) => {
  const qEmail = query(collection(db, "users"), where("email", "==", userData.email));
  const snapEmail = await getDocs(qEmail);
  if (!snapEmail.empty) throw new Error("Uživatel s tímto emailem již existuje.");

  const qName = query(collection(db, "users"), where("name", "==", userData.name));
  const snapName = await getDocs(qName);
  if (!snapName.empty) throw new Error("Uživatel s tímto jménem již existuje.");

  // Generate Short Code
  // Algorithm: removing accents, TitleCase.
  // 1. First 3 chars of surname: "Nov"
  // 2. First 2 chars of surname + first char of firstname: "NoJ"
  // 3. First 2 chars of surname + number (1, 2, ...): "No1", "No2"

  // We need the data from normalized/parts, so let's move Short generation AFTER defining them.
  // For now, removing the manual Short validation here.
  // The actual generation will happen below after variables are defined.

  // Generate Custom Document ID
  const normalized = userData.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const parts = normalized.split(/\s+/);

  const toTitleCase = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // Fallback if name format is unexpected, though validation ensures >=2 words
  const surname = parts.length > 0 ? toTitleCase(parts[parts.length - 1]) : "User";
  const firstnamePart = parts.length > 1 ? parts.slice(0, parts.length - 1).join("") : "Unknown";
  const firstname = toTitleCase(firstnamePart);

  let docId = surname;
  let userDocRef = doc(db, "users", docId);
  let userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    for (let i = 1; i <= firstname.length; i++) {
      docId = surname + firstname.substring(0, i);
      userDocRef = doc(db, "users", docId);
      userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) break;
    }
  }

  // If even after full firstname appended it exists, we throw error (or could switch to random, but user said "algorithm should always get unique")
  if (userDocSnap.exists()) {
    throw new Error("Nepodařilo se vygenerovat unikátní ID (kolize jmen).");
  }

  // --- Short Code Generation ---
  let shortCode = "";
  const surnameClean = surname; // Already TitleCase and normalized logic applied effectively via toTitleCase(parts...)
  const firstnameClean = firstname;

  // Attempt 1: Surname 3 chars
  let candidate = surnameClean.substring(0, 3);
  if (candidate.length < 3) {
    // Pad with 'X' or similar if surname is super short? Promt says "try to use just first 3".
    // If surname is "Ng", substring(0,3) is "Ng". It is fine.
  }

  // Helper to check uniqueness
  const isShortUnique = async (code) => {
    const q = query(collection(db, "users"), where("short", "==", code));
    const snap = await getDocs(q);
    return snap.empty;
  };

  if (await isShortUnique(candidate)) {
    shortCode = candidate;
  } else {
    // Attempt 2: Surname 2 chars + Firstname 1 char
    candidate = surnameClean.substring(0, 2) + firstnameClean.substring(0, 1);
    if (await isShortUnique(candidate)) {
      shortCode = candidate;
    } else {
      // Attempt 3: Surname 2 chars + Number
      let counter = 1;
      while (true) {
        candidate = surnameClean.substring(0, 2) + counter;
        if (await isShortUnique(candidate)) {
          shortCode = candidate;
          break;
        }
        counter++;
      }
    }
  }

  userData.short = shortCode;

  await setDoc(userDocRef, userData);
}

const updateUser = async (userId, userData) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, userData);
}

const deleteUser = async (userId) => {
  const userRef = doc(db, "users", userId);
  await deleteDoc(userRef);
}

const sendUserPasswordReset = async (email) => {
  await sendPasswordResetEmail(auth, email);
}

export {
  getScorecardId, getPlayingHCP, getHolesHCP, getHoleShots, setHoleScore, getRyderStandings,
  getRoundScore, getTeamRoundScore, getFlight, createNewScorecard, resetScorecard, getRyderHoleClass,
  getRyderHoleScore, getRyderMatchClass, getRyderMatchText, setMatchScore, formatRyderStatus,
  checkUserAdmin, getLastRyderMatch, createUser, updateUser, deleteUser, sendUserPasswordReset
}