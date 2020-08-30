const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const userManagment = require('./functions/UserManagment');
const db = require('./database/db');
const bcrypt = require('bcryptjs');
const mail = require('./functions/sendMail');
const nodemailer = require('./functions/sendMail');
const { response } = require('express');
const { activateUser, userLoggedIn } = require('./functions/UserManagment');
const e = require('express');
const path = require('path');
const sendMail = require('./functions/sendMail');
const UserManagment = require('./functions/UserManagment');
const app = express();

app.use(cookieParser());

app.use('/static', express.static('static'))

app.use(session({ secret: 'secretKey', saveUninitialized: true, resave: true }));

app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 3000;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
    res.render('home');
    if (req.session.loggedIn === 1){
        res.redirect('/match');
    }
});

app.get('/session', (req, res) => {
    console.log(req.session);
});

app.post('/login', (req, res) => {
    let err = [];
    console.log(req.body);

    let User = db.connection.query("SELECT active from Users WHERE email = ?", req.body.email, (err, rows) => {
        rows.forEach((row) => {
            if(`${row.active}` == 1)
                userManagment.userLogin(req.body.email, req.body.password, req, res);
            else {
                res.redirect('/');
            }
        });
    });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/profile', (req, res) => {
    userManagment.userLoggedOut(req, res);
    UserManagment.userProfile(req, res);
    console.log(req.session.loggedIn);
});

app.get('/logout', (req, res) => {
    req.session.loggedIn = 0;
    req.session.email = '';
    res.redirect('/');
})

app.get('/activate/:activationCode([a-z0-9_$.]{60})', (req, res) => {
    userManagment.activateUser(req.params.activationCode);
    res.redirect('..');
})

app.get('/forgotPassword', (req, res) => {
    res.render('forgotPassword');
});

app.post('/resetPassword', (req, res) => {
    sendMail.sendPassForget(req.body.email);
});

app.get('/resetPassword/:email([a-z0-9_$.@]{60})', (req, res) => {
    res.render('resetPassword');
})

app.post('/resetPass', (req,res) => {
    
});

app.get('/newAccount', (req, res) => {
    res.render('newAccount', {
        title: 'Signup'
    })
});

app.post('/signup', (req, res) => {
    console.log(req.body);
    let err = [];

    if (req.body.password !== req.body.password2) {
        err.push({ text: 'Passwords do not match' });
    }
    if (req.body.password.length < 5) {
        err.push({ text: 'Password must have at least 5 characters' });
    }
    if (err.length > 0) {
        res.render('newAccount', {
            err: err,
            title: 'Error',
            fullname: req.body.fullname,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2
        });
    } else {
        let User = db.connection.query("SELECT * from Users WHERE email = ?", req.body.email, (err, rows) => {
            if (rows && rows.length) {
                let err = [];
                err.push({ text: 'Email already exists' });
                res.render('newAccount', {
                    title: 'Signup',
                    err: err
                });
            } else {
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(req.body.password, salt);
                const newUser = {
                    fullname: req.body.fullname,
                    email: req.body.email,
                    password: hash,
                    active: 0
                };
                userManagment.addUser(newUser);
                nodemailer.sendVerifyEmail(req.body.email, "127.0.0.1:3000/activate/" + hash);
                console.log(newUser);
                res.redirect('/');
            }
        });
    }
});

app.get('/match', (req, res) => {
    userManagment.userLoggedOut(req, res);
    res.render('match');
});

app.post('/imageUpload', (req, res) => {
    
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});