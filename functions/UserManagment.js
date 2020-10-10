const db = require('../database/db');
const bcrypt = require('bcryptjs');
const location = require('../functions/geolocation');
const { session } = require('passport');

function addUser(newUser) {
    db.connection.query('INSERT INTO users SET ?', newUser, (err, res) => {
        if (err) throw (err);

        console.log("Insert was succesful");
    });

    addProfile(newUser);
}

async function addProfile(newUser) {
    let userID = '';
    db.connection.query("SELECT userID FROM users WHERE email = ?", newUser.email, (err, rows) => {
        userID = rows[0].userID

        newProfile = {
            gender: 'bi',
            interestedIn: 'both',
            bio: '',
            gaming: false,
            netflix: false,
            music: false,
            userID: userID,
            popularity: 100,
            age: 18
        }

        db.connection.query('INSERT INTO profile SET ?', newProfile, (err, res) => {
            if (err) throw (err);

            console.log("Insert was succesful");
        })
    });
}

function userLogin(email, password, req, res) {
    let passQry = db.connection.query("SELECT * FROM users WHERE email = ?", email, (err, rows) => {
        if (rows && rows)
            rows.forEach((row) => {
                let pass = `${row.password}`;
                bcrypt.compare(password, pass, (err, response) => {
                    if (err) throw (err);
                    if (response) {
                        req.session.loggedIn = 1;
                        req.session.email = email;
                        req.session.userID = `${row.userID}`;
                        console.log("user signed in");
                        res.redirect('/match')
                    } else {
                        let err = [];

                        err.push({ text: 'Passwords is incorrect' });
                        res.render('home', {
                            err: err,
                            title: 'Error',
                            email: req.body.email,
                            password: req.body.password
                        });
                    }
                });
            });
        console.log("Found " + rows);
    });
}

function activateUser(authCode) {
    let activateQry = db.connection.query("UPDATE users SET active = 1 WHERE password = ?", authCode, (err, result) => {
        if (err) throw (err);

        console.log('User is now active');
    });
}

function resetPassword(password, email) {
    let resetPassQry = db.connection.query("UPDATE users SET password = ? WHERE email = ?", [password, email], (err, result) => {
        if (err) throw (err);

        console.log('User has changed passwords');
    })
}

function userLoggedOut(req, res) {
    if (req.session.loggedIn === 0 || req.session.loggedIn === undefined) {
        res.redirect('/');
        res.render('home');
    }
};

function userLoggedIn(req, res) {
    if (req.session.userLoggedIn === 1) {
        res.redirect('/match');
        res.render('match');
    }
};

function userProfile(req, res) {
    let img = '';
    let imgQry = db.connection.query("SELECT * FROM images WHERE userID = ? ORDER by 1 ASC", req.session.userID, (err, rows) => {
        rows.forEach((row) => {
            img = `${row.filepath}` + '.jpg';
        });
    });
    let fullname = '';
    let passQry = db.connection.query("SELECT * FROM users WHERE email = ?", req.session.email, (err, rows) => {
        rows.forEach((row) => {
            fullname = `${row.fullname}`
        });
    });
    let profileQry = db.connection.query("SELECT * FROM profile WHERE userid = ?", req.session.userID, (err, rows) => {
        rows.forEach((row) => {
            let male = false;
            let female = false;
            let bi = false;
            if (`${row.gender}` == 'male') {
                male = true;
            } else if (`${row.gender}` == "female") {
                female = true;
            } else {
                bi = true;
            }
            let intMale = false;
            let intFemale = false;
            let intBoth = false;
            if (`${row.interestedIn}` == "male") {
                intMale = true;
            } else if (`${row.interestedIn}` == "female") {
                intFemale = true;
            } else {
                intBoth = true;
            }
            let age = '18';
            if (`${row.age}` == 'undefined') {
                age = '18'
            } else {
                age = `${row.age}`
            }
            let bio = `${row.bio}`
            let userProfile = {
                image: img,
                fullname: fullname,
                age: age,
                bio: bio,
                gaming: `${row.gaming}`,
                netflix: `${row.netflix}`,
                music: `${row.music}`,
                male: male,
                female: female,
                bi: bi,
                maleSelected: intMale,
                femaleSelected: intFemale,
                bothSelected: intBoth
            }
            res.render('profile', userProfile);
        })
    });
};

function updateProfile(req, res) {
    let gender = '';
    if (req.body.gender == 'male') {
        gender = 'male';
    } else if (req.body.gender == 'female') {
        gender = 'female';
    }
    let interestedIn = '';
    if (req.body.interested == 'intMale') {
        interestedIn = 'male';
    } else if (req.body.interested == 'intFemale') {
        interestedIn = 'female';
    } else {
        interestedIn = 'both';
    }
    let gaming = 0;
    if (req.body.gaming == 'gaming') {
        gaming = 1;
    }
    let music = 0;
    if (req.body.music == 'music') {
        music = 1;
    }
    let netflix = 0;
    if (req.body.netflix == 'netflix') {
        netflix = 1;
    }
    if (req.body)
        updateProf = {
            gender: gender,
            interestedIn: interestedIn,
            bio: req.body.bio,
            gaming: gaming,
            netflix: netflix,
            music: music,
            userID: req.session.userID,
            popularity: 100,
            age: req.body.age
        }
    db.connection.query('UPDATE profile set ? where userID = ?', [updateProf, req.session.userID]);
    res.redirect('/profile');
};

function viewMatch(req, res) {
    let img = '';
    let imgQry = db.connection.query("SELECT * FROM images WHERE userID = ? ORDER by 1 ASC", req.params.userID, (err, rows) => {
        rows.forEach((row) => {
            img = `${row.filepath}` + '.jpg';
        });
    });
    let fullname = '';
    let passQry = db.connection.query("SELECT * FROM users WHERE userID = ?", req.params.userID, (err, rows) => {
        rows.forEach((row) => {
            fullname = `${row.fullname}`
        });
    });
    let profileQry = db.connection.query("SELECT * FROM profile WHERE userid = ?", req.params.userID, (err, rows) => {
        rows.forEach((row) => {
            let male = false;
            let female = false;
            let bi = false;
            if (`${row.gender}` == 'male') {
                male = true;
            } else if (`${row.gender}` == "female") {
                female = true;
            } else {
                bi = true;
            }
            let intMale = false;
            let intFemale = false;
            let intBoth = false;
            if (`${row.interestedIn}` == "male") {
                intMale = true;
            } else if (`${row.interestedIn}` == "female") {
                intFemale = true;
            } else {
                intBoth = true;
            }
            let age = '18';
            if (`${row.age}` == 'undefined') {
                age = '18'
            } else {
                age = `${row.age}`
            }
            let bio = `${row.bio}`
            let userProfile = {
                userID: req.params.userID,
                image: img,
                fullname: fullname,
                age: age,
                bio: bio,
                gaming: `${row.gaming}`,
                netflix: `${row.netflix}`,
                music: `${row.music}`,
                male: male,
                female: female,
                bi: bi,
                maleSelected: intMale,
                femaleSelected: intFemale,
                bothSelected: intBoth
            }
            res.render('viewProfile', userProfile);
        })
    });
}

module.exports = {
    addUser: addUser,
    activateUser: activateUser,
    resetPassword: resetPassword,
    userLogin: userLogin,
    userLoggedOut: userLoggedOut,
    userProfile: userProfile,
    updateProfile: updateProfile,
    userLoggedIn: userLoggedIn,
    viewMatch: viewMatch
}