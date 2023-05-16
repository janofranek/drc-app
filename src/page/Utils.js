import { db } from '../cred/firebase';
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

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

export { getScorecardId, getPlayingHCP, getHolesHCP, getHoleShots, setHoleScore, 
    getRoundSkore, getTeamRoundSkore, getFlight, createNewScorecard, resetScorecard }