
function getPlayingHCP (player, course, teeColor){
    let teeBox = course.tees.filter(tee => tee.color === teeColor)[0]
    return Math.round(player.hcp * (teeBox.SR / 113) + (teeBox.CR - course.par))
}

function getHoleShots (holeIndex, playingHcp){
    
    if ( playingHcp >= 36 ) {
        return ( holeIndex + 36 >= playingHcp ? 2 : 3 )
    } else if ( playingHcp >= 18 ) {
        return ( holeIndex + 18 >= playingHcp ? 1 : 2 )
    } else if ( playingHcp >= 0 ) {
        return ( holeIndex >= playingHcp ? 0 : 1 )
    } else {
        return ( holeIndex - 18 >= playingHcp ? -1 : 0 )
    }
}

function getHolesHCP (player, course, teeColor){
    let playingHcp = getPlayingHCP(player, course, teeColor)
    return course.holes.map((hole) => getHoleShots(hole.index, playingHcp))
}

const checkScorecardExists = async (db, playerId, date, courseName, teeColor) => {
    const scorecardId = date + " " + playerId;
    const scorecardRef = db.collection('scorecards').doc(scorecardId);
    const doc = await scorecardRef.get();
    if (!doc.exists) {
        let emptyHoles = [];
        for (let i = 0; i < 18; i++) {
            emptyHoles[i] = { "hole": i+1, "score": 0 };
          }
        const newScorecard = { "course": courseName,
            "player": playerId,
            "tee": teeColor,
            "holes": emptyHoles }
        await scorecardRef.set(newScorecard)
    }    
}



export { getPlayingHCP, getHolesHCP, checkScorecardExists }