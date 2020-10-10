const db = require("../database/db");

function display(req, res) {
    people = [];
    let interestIn;
    db.connection.query('select interestedIn from profile where userID = ?', `${req.session.userID}`, (req2, rows) => {
        rows.forEach(row => {
            interestIn = `${row.interestedIn}`
        })
        if (interestIn == 'male' || interestIn == 'female') {
            db.connection.query('select * from profile where gender = ? and userID != ?', [interestIn, req.session.userID], (req, rows) => {
                rows.forEach(row => {
                    db.connection.query('select * from users where userID = ?', `${row.userID}`, (req2, rows2) => {
                        rows2.forEach(row2 => {
                            db.connection.query('select * from images where userID = ?', `${row.userID}`, (req3, rows3) => {
                                rows3.forEach(row3 => {
                                    let blocked = 0
                                    db.connection.query('select * from blocked where blockerID = ? AND blockingID = ?', [38, `${row2.userID}`], (err, rows4) => {
                                        if (err) {
                                            return
                                        } else {
                                        rows4.forEach(row4 => {
                                            blocked = `${row4.blocking}`
                                        })
                                        if (blocked == 0) {
                                            people.push({
                                                userID: `${row2.userID}`,
                                                image: `${row3.filepath}` + '.jpg',
                                                fullname: `${row2.fullname}`,
                                                popularity: `${row.popularity}`,
                                                age: `${row.age}`
                                            })
                                        }
                                    }
                                    })
                                })
                            })
                        })
                    })
                })
            })
        } else {
            db.connection.query('select * from profile ', (req2, rowsA) => {
                rowsA.forEach(row => {
                    db.connection.query('select * from users where userID = ? and userID != ?', [row.userID, req.session.userID], (req2, rows2) => {
                        rows2.forEach(row2 => {
                            db.connection.query('select * from images where userID = ?', `${row.userID}`, (req3, rows3) => {
                                rows3.forEach(row3 => {
                                    people.push({
                                        userID: `${row2.userID}`,
                                        image: `${row3.filepath}` + '.jpg',
                                        fullname: `${row2.fullname}`,
                                        popularity: `${row.popularity}`,
                                        age: `${row.age}`
                                    })
                                })
                            })
                        })
                    })
                })
            })
        }
        res.render('match', { people: people });
    })
}

function notification(req, res) {
    messages = [];
    const promise = db.connection.query("select * from notifications where userID = ? order by 1 desc", [req.session.userID], (err, rows) => {
        rows.forEach(row => {
            messages.push({
                notification: `${row.message}`
            })
        })
        res.render('notifications', { messages: messages });
    })
}

function blockProfile(req, res) {
    db.connection.query("INSERT INTO blocked (`blockingID`, `blockerID`) VALUES (?, ?)", [req.params.userID, req.session.userID]);
    res.redirect('/match');
}

function likeProfile(req, res) {
    const promise = db.connection.query("select matchID from matches where likedID = ? AND likerID =?", [req.session.userID, req.params.userID], (err, rows) => {
        rows.forEach(row => {
            db.connection.query("INSERT INTO matches (matchID, `likedID`, `like`, `likerID`, `match`) VALUES(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `match`= ?", [`${row.matchID}`, req.params.userID, true, req.session.userID, false, true])
            db.connection.query("INSERT INTO `notifications`(`userID`, `message`) VALUES (? , ?)", [req.params.userID, 'You have a new match'])
            res.redirect('/viewProfile/' + req.params.userID);
        })
    })
    db.connection.query("INSERT INTO matches (`likedID`, `like`, `likerID`, `match`) VALUES(?, ?, ?, ?)", [req.params.userID, true, req.session.userID, false, true])
    db.connection.query("INSERT INTO `notifications`(`userID`, `message`) VALUES (? , ?)", [req.params.userID, 'Someone liked your profile'])

}

function displayAdv(req, res) {
    try {
        if (req.body.comInterests != 'on') {
            people = [];
            let interestIn;
            db.connection.query('select interestedIn from profile where userID = ?', `${req.session.userID}`, (req2, rows) => {
                rows.forEach(row => {
                    interestIn = `${row.interestedIn}`
                })
                if (interestIn == 'male' || interestIn == 'female') {
                    db.connection.query('select * from profile where gender = ? and userID != ? and AGE >= ? and AGE <= ?', [interestIn, req.session.userID, req.body.minAge, req.body.maxAge], (req, rows) => {
                        rows.forEach(row => {
                            db.connection.query('select * from users where userID = ?', `${row.userID}`, (req2, rows2) => {
                                rows2.forEach(row2 => {
                                    db.connection.query('select * from images where userID = ?', `${row.userID}`, (req3, rows3) => {
                                        rows3.forEach(row3 => {
                                            people.push({
                                                userID: `${row2.userID}`,
                                                image: `${row3.filepath}` + '.jpg',
                                                fullname: `${row2.fullname}`,
                                                popularity: `${row.popularity}`,
                                                age: `${row.age}`
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                } else {
                    db.connection.query('select * from profile ', (req2, rowsA) => {
                        rowsA.forEach(row => {
                            db.connection.query('select * from profile where gender = ? and userID != ? and AGE >= ? and AGE =< ?', [row.userID, req.session.userID, req.body.minAge, req.body.maxAge], (req2, rows2) => {
                                rows2.forEach(row2 => {
                                    db.connection.query('select * from images where userID = ?', `${row.userID}`, (req3, rows3) => {
                                        rows3.forEach(row3 => {
                                            people.push({
                                                image: `${row3.filepath}` + '.jpg',
                                                fullname: `${row2.fullname}`,
                                                popularity: `${row.popularity}`,
                                                age: `${row.age}`
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                }
            })
        } else {
            people = [];
            let interestIn;
            db.connection.query('select interestedIn from profile where userID = ?', `${req.session.userID}`, (req2, rows) => {
                rows.forEach(row => {
                    interestIn = `${row.interestedIn}`
                })
                if (interestIn == 'male' || interestIn == 'female') {
                    db.connection.query('select * from profile where gender = ? and userID != ? and AGE >= ? and AGE <= ?', [interestIn, req.session.userID, req.body.minAge, req.body.maxAge], (req, rows) => {
                        rows.forEach(row => {
                            let comInt = false;
                            db.connection.query('select * from users where userID = ?', `${row.userID}`, (req2, rows2) => {
                                rows2.forEach(row2 => {
                                    interests = [`${row.gaming}`, `${row.music}`, `${row.netflix}`]
                                    db.connection.query('select * from images where userID = ?', `${row.userID}`, (req3, rows3) => {
                                        rows3.forEach(row3 => {
                                            interests.forEach(interest => {
                                                if (interest == 1) {
                                                    comInt = true;
                                                }
                                            })
                                            if (comInt) {
                                                people.push({
                                                    image: `${row3.filepath}` + '.jpg',
                                                    fullname: `${row2.fullname}`,
                                                    popularity: `${row.popularity}`,
                                                    age: `${row.age}`
                                                })
                                            }
                                        })
                                    })
                                })
                            })
                        })
                    })
                } else {
                    db.connection.query('select * from profile ', (req2, rowsA) => {
                        rowsA.forEach(row => {
                            db.connection.query('select * from profile where gender = ? and userID != ? and AGE >= ? and AGE =< ?', [row.userID, req.session.userID, req.body.minAge, req.body.maxAge], (req2, rows2) => {
                                rows2.forEach(row2 => {
                                    interests.push({
                                        gaming: `${row.gaming}`,
                                        music: `${row.music}`,
                                        netflix: `${row.netflix}`
                                    })
                                    db.connection.query('select * from images where userID = ?', `${row.userID}`, (req3, rows3) => {
                                        rows3.forEach(row3 => {
                                            if (interests.some(function (item) {
                                                return item == true;
                                            })) {
                                                people.push({
                                                    image: `${row3.filepath}` + '.jpg',
                                                    fullname: `${row2.fullname}`,
                                                    popularity: `${row.popularity}`,
                                                    age: `${row.age}`
                                                })
                                            }
                                        })
                                    })
                                })
                            })
                        })
                    })
                }
            })
        }
        res.render('displayAdvanced', { people: people });
    } catch {
        res.redirect('/match');
    }
}

module.exports = {
    display: display,
    likeProfile: likeProfile,
    displayAdv: displayAdv,
    notification: notification,
    blockProfile: blockProfile
}