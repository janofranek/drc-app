import { db } from '../cred/firebase';
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

const checkUserAdmin = (authEmail, users) => {
    if (!authEmail || !users) {
        return false
    } else {
        return users.filter(user => user.email.toLowerCase() === authEmail.toLowerCase() && user.admin).length > 0
    }
}
const  getScorecardId = (date, playerId) => {
    return date + " " + playerId;
}
const  getPlayingHCP = (player, course, tee = null) => {
    const teeColor = tee ?? player.tee
    let teeBox = course.tees.filter(tee => tee.color === teeColor)[0]
    return Math.round(player.hcp * (teeBox.SR / 113) + (teeBox.CR - course.par))
}

const getHoleShots = (holeIndex, playingHcp) => {
    
    if ( playingHcp >= 36 ) {
        return ( holeIndex + 36 > playingHcp ? 2 : 3 )
    } else if ( playingHcp >= 18 ) {
        return ( holeIndex + 18 > playingHcp ? 1 : 2 )
    } else if ( playingHcp >= 0 ) {
        return ( holeIndex > playingHcp ? 0 : 1 )
    } else {
        return ( holeIndex - 18 > playingHcp ? -1 : 0 )
    }
}

const getHolesHCP = (player, course) => {
    const playingHcp = getPlayingHCP(player, course)
    return course.holes.map((hole) => getHoleShots(hole.index, playingHcp))
}

const getStableford2 = (score, par, shots) => {
    if (score === 0) {
        return 0
    } else if (score < par + shots + 2 ) {
        return par + shots + 2 - score
    } else {
        return 0
    }
}

const getStableford = (hole) => {
    return getStableford2( hole.score, hole.par, hole.shots)
}

const setHoleScore = async (scorecardId, holeNumber, newScore) => {
    const scorecardRef = doc(db, "scorecards", scorecardId);
    const scorecardSnap = await getDoc(scorecardRef);
    let newHoles = [...scorecardSnap.data().holes]
    newHoles[holeNumber-1].score = Number(newScore)
    newHoles[holeNumber-1].stableford = getStableford(newHoles[holeNumber-1])
    await updateDoc(scorecardRef, { holes: newHoles });
}

const createNewScorecard = async (scorecardId, player, course, force = false) => {
    const docSnap = await getDoc(doc(db,'scorecards',scorecardId));
    //insert only if the scorecard does not already exist
    if (!docSnap.exists() || force) {
      const playingHCP = getPlayingHCP(player, course);
      const newScorecard = { "course": course.id,
          "player": player.id,
          "tee": player.tee,
          "playingHCP": playingHCP,
          "holes": [] }
        course.holes.forEach(hole => {
        newScorecard.holes.push(
          {
            "hole": hole.hole,
            "par": hole.par,
            "shots": getHoleShots( hole.index, playingHCP ),
            "score": 0,
            "stableford": 0
          }
        )
      })
      await setDoc(doc(db,'scorecards',scorecardId), newScorecard);
    }
}

const resetScorecard = async (scorecardId, player, course, tee = null) => {
    const teeColor = tee ?? player.tee
    const scorecardRef = doc(db, "scorecards", scorecardId);
    const docSnap = await getDoc(scorecardRef);
    //update only if the scorecard does already exist
    if (docSnap.exists()) {
      const playingHCP = getPlayingHCP(player, course, teeColor);
      const updateScorecard = { "tee": teeColor,
          "playingHCP": playingHCP,
          "holes": [] }
      docSnap.data().holes.forEach( (hole, index) => {
        const shots = getHoleShots( course.holes[index].index, playingHCP )
        const stbl = getStableford2( hole.score, hole.par, shots )
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

const getRoundSkore = (player, date, scorecards) => {
    const scorecardId = date + " " + player
    const scorecard = scorecards.filter(sc => sc.id === scorecardId)
    if (scorecard.length === 0) {
        return [0, 0]
    } else {
        return [
            scorecard[0].holes.reduce((a,v) =>  a = a + v.score , 0  ),
            scorecard[0].holes.reduce((a,v) =>  a = a + v.stableford , 0  ),
        ]
    }
}

const getTeamRoundSkore = (team, date, resultsTable) => {
    let roundStbl = [];
    team.players.forEach(player=>{
        const playerRow = resultsTable.filter(r => r.player === player)[0]
        roundStbl.push(playerRow[date+"_stbl"])
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
  
    return holeClass + ( scoreMap.get(score) ?? "" );
}

const getRyderMatchScore = (match) => {
    return match.holes.reduce((a, v) => a += v, 0);
}

const getRyderMatchClass = (match, small = false) => {
    const score = getRyderMatchScore(match);
    let matchClass = "ryder-score-total";
    matchClass += (small ? "-small" : "")
    if ( score < 0 ) {
        matchClass += " stt-";
    } else if ( score > 0 ) {
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

const getRyderHoleScore = (buttonId) =>{
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
    if ( newScore === null ) {
        newHoles[holeNumber-1] = null;
    } else {
        newHoles[holeNumber-1] = Number(newScore);
    }
    updateData["holes"] = newHoles;
    // detect, if the match is finished
    const matchScore = newHoles.reduce((a, v) => a += (v ?? 0), 0);
    const holesToPlay = totalHolesCount - newHoles.filter(h => !(h == null) ).length;
    // last hole
    if ( holesToPlay === 0 ) {
        updateData["final"] = true;
        updateData["final_score"] = Math.sign(matchScore);
        updateData["result"] = ( matchScore === 0 ? "square" : Math.abs(matchScore).toString() + " up")
    // score is higher than number of holes to play
    } else if ( Math.abs(matchScore) > holesToPlay) {
        updateData["final"] = true;
        updateData["final_score"] = Math.sign(matchScore);
        updateData["result"] = Math.abs(matchScore).toString() + "&" + holesToPlay.toString();
    // if the match was finished, but after score change it is not
    } else if ( matchSnap.data().final && holesToPlay > 0 &&  Math.abs(matchScore) <= holesToPlay) {
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
    const hasHalf = ( Math.abs(score - wholePart - 0.5) < tolerance );
    if (wholePart === 0 && hasHalf) {
        return halfSymbol;
    } else if (hasHalf) {
        return wholePart.toString() + " " + halfSymbol;
    } else {
        return wholePart.toString();
    }

}

const getLastRyderMatch = (allTournaments) => {
    console.log(allTournaments)
    const tournaments = allTournaments.filter( t => (t.system === "rydercup"))
    console.log(tournaments)
    const lastStartDate = tournaments.reduce((a, v) => Math.max(a, v.datestart), tournaments[0].datestart)
    console.log(lastStartDate)
    return tournaments.filter( t => (t.datestart === lastStartDate))

}

const getRyderStandings = (allMatches, date = null) => {
    const matches = allMatches.filter( m => ( date == null || m.id.substring(0,10) === date))

    const sttFinal = matches
        .filter( m => m.final && m.final_score <= 0 )
        .reduce((a ,v) =>  a = a + ( v.final_score < 0 ? 1.0 : 0.5 ) , 0.0)
    const latFinal = matches
        .filter( m => m.final && m.final_score >= 0 )
        .reduce((a ,v) =>  a = a + ( v.final_score > 0 ? 1.0 : 0.5 ) , 0.0)
    const liveMatches = matches.filter( m => !m.final && m.holes.length > 0 && m.holes.some((h) => h!==null))
    let sttPrelim = sttFinal;
    let latPrelim = latFinal;
    for (const m of liveMatches) {
        const liveScore = m.holes.reduce((a, v) => a += (v ?? 0), 0)
        if ( liveScore < 0 ) {
            sttPrelim += 1.0;
        } else if ( liveScore > 0 ) {
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

export { getScorecardId, getPlayingHCP, getHolesHCP, getHoleShots, setHoleScore, getRyderStandings,
    getRoundSkore, getTeamRoundSkore, getFlight, createNewScorecard, resetScorecard, getRyderHoleClass,
    getRyderHoleScore, getRyderMatchClass, getRyderMatchText, setMatchScore, formatRyderStatus,
    checkUserAdmin, getLastRyderMatch }