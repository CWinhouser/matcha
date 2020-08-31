const express = require('express');
const fileUpload = require('express-fileupload');
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
const match = require('./functions/match')
const { response } = require('express');
const { activateUser, userLoggedIn } = require('./functions/UserManagment');
const e = require('express');
const path = require('path');
const sendMail = require('./functions/sendMail');
const UserManagment = require('./functions/UserManagment');
const { time } = require('console');
const handlebarsHelpers = require('./functions/handlebars-helpers');
const FileStore = require('session-file-store')(session);
const app = express();

db.createTables();

app.use(cookieParser());

app.use('/static', express.static('static'))

let fileStoreOptions = { path: './sessions' };

app.use(session({
    store: new FileStore(fileStoreOptions),
    secret: 'secretKey',
    saveUninitialized: true,
    resave: true
}));

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

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: require('./functions/handlebars-helpers')
}));
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
    res.render('home');
    if (req.session.loggedIn === 1) {
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
            if (`${row.active}` == 1)
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
    req.session.userID = '';
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
    res.redirect('/');
});

app.get('/resetPassword/:email([a-z0-9_$\.@]+)', (req, res) => {
    req.session.emailReset = req.params.email;
    res.render('resetPassword');
})

app.post('/resetPass', (req, res) => {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    db.connection.query('UPDATE users set password = ? where email = ?', [hash, req.session.emailReset]);
    res.redirect('/');
})

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

app.use(fileUpload());

app.post('/imageUpload', function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let avatar = req.files.avatar;
    const fileName = Math.random().toString(36).substring(2);

    // Use the mv() method to place the file somewhere on your server
    avatar.mv(`./static/userImage/${fileName}.jpg`, function (err) {
        if (err)
            return res.status(500).send(err);
        res.redirect('/profile');
    });
    db.connection.query('INSERT INTO images SET userID = ?, filepath = ?', [req.session.userID, fileName], (err, res) => {
        if (err) throw (err);

        console.log("Insert was succesful");
    })
});

app.post('/updateProfile', (req, res) => {
    userManagment.updateProfile(req, res);
});

app.get('/resendVerify', (req, res) => {
    res.render('resendVerify');
})

app.post('/resendLink', (req, res) => {
    let pass = '';
    db.connection.query('SELECT password FROM users WHERE email = ?', req.body.email, (err, rows) => {
        rows.forEach((row) => {
            pass = `${row.password}`


            sendMail.sendVerifyEmail(req.body.email, '127.0.0.1:3000/activate/' + pass);
            res.redirect('/');
        })
    });
})

app.get('/match', (req, res) => {
    userManagment.userLoggedOut(req, res);
    match.display(req, res);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});