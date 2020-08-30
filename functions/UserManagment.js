const db = require('../database/db');
const bcrypt = require('bcryptjs');
const { session } = require('passport');

function addUser(newUser) {
    db.connection.query('INSERT INTO users SET ?', newUser, (err, res) => {
        if (err) throw (err);

        console.log("Insert was succesful");
    })
}

function userLogin(email, password, req, res) {
    let passQry = db.connection.query("SELECT * FROM users WHERE email = ?", email, (err, rows) => {
        rows.forEach((row) => {
            let pass = `${row.password}`;
            bcrypt.compare(password, pass, (err, response) => {
                if (err) throw (err);
                if (response) {
                    req.session.loggedIn = 1;
                    req.session.email = email;
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

function userLoggedOut(req, res){
    if(req.session.loggedIn === 0 || req.session.loggedIn === undefined){
        res.redirect('/');
        res.render('home');
    }
};

function userLoggedIn(req, res){
    if(req.session.userLoggedIn === 1){
        res.redirect('/match');
        res.render('match');
    }
};

function userProfile(req, res){
    let passQry = db.connection.query("SELECT * FROM users WHERE email = ?", req.session.email, (err, rows) => {
        res.render('profile', {
            fullname: 'Kyle Twomey'
        });
    });
};

module.exports = {
    addUser: addUser,
    activateUser: activateUser,
    resetPassword: resetPassword,
    userLogin: userLogin,
    userLoggedOut: userLoggedOut,
    userProfile: userProfile,
    userLoggedIn: userLoggedIn
}