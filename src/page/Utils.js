import { db } from '../cred/firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";

function getPlayingHCP (player, course){
    let teeBox = course.tees.filter(tee => tee.color === player.tee)[0]
    return Math.round(player.hcp * (teeBox.SR / 113) + (teeBox.CR - course.par))
}

function getHoleShots (holeIndex, playingHcp){
    
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

function getHolesHCP (player, course){
    const playingHcp = getPlayingHCP(player, course)
    return course.holes.map((hole) => getHoleShots(hole.index, playingHcp))
}

const getStableford = (hole) => {
    if (hole.score === 0) {
        return 0
    } else if (hole.score < hole.par + hole.shots + 2 ) {
        return hole.par + hole.shots + 2 - hole.score
    } else {
        return 0
    }
}

const setHoleScore = async (scorecardId, holeNumber, newScore) => {
    const scorecardRef = doc(db, "scorecards", scorecardId);
    const scorecardSnap = await getDoc(doc(db,'scorecards',scorecardId));
    let newHoles = [...scorecardSnap.data().holes]
    newHoles[holeNumber-1].score = Number(newScore)
    newHoles[holeNumber-1].stableford = getStableford(newHoles[holeNumber-1])
    await updateDoc(scorecardRef, { holes: newHoles });
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

export { getPlayingHCP, getHolesHCP, getHoleShots, setHoleScore, getRoundSkore }