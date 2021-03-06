const express = require('express');
const app = express();
// For testing purposes
exports.app = app;
// For testing purposes
const cookieSession = require('cookie-session');
const csurf = require('csurf');
const helmet = require('helmet');
// deployed to heroku
let secrets;
if (process.env.cookie_secret) {
    secrets = process.env.cookie_secret;
} else {
    secrets = require('./secrets.json').sessionSecret;
}
//
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const bcrypt = require('bcryptjs');
const { compare } = bcrypt;
// validator
const { check, validationResult } = require('express-validator');
// Rendering middleware
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
// Logging middleware
app.use(morgan('dev'));
// Security middleware
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);
// open sources
app.use(express.static('./public'));
app.use(express.static('./dist'));
// body-parser
app.use(express.urlencoded({ extended: false }));
// cookie handlers
app.use(
    cookieSession({
        name: 'session',
        keys: [secrets],
        // Cookie Options 24hrs
        maxAge: 24 * 60 * 60 * 1000,
    })
);
// CSURF protection
app.use(csurf());
app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});
// Click jacking protection
app.use((req, res, next) => {
    res.setHeader('x-frame-options', 'deny');
    next();
});

// THIS IS HOME
app.get('/', (req, res) => {
    req.session.userID
        ? res.render('home', {
              layout: 'logged',
              loggedIn: true,
          })
        : res.render('home', {
              layout: 'main',
              loggedOut: true,
          });
});

// This is the login page
app.get('/login', (req, res) => {
    if (!req.session.userID) {
        res.render('login', {
            title: 'login',
        });
    } else {
        res.redirect('/petition');
    }
});
// This is post on the login Page
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const AttemptLog = await db.logAttempt(email);
        const match = await compare(password, AttemptLog.rows[0].password);
        if (match) {
            req.session.userID = AttemptLog.rows[0].user_id;
            res.redirect('/petition');
        } else {
            console.log(match);
            res.render('login', {
                title: 'Login',
                hasPwErrors: true,
                errors: 'Check your password and try again',
            });
        }
    } catch (error) {
        res.render('login', {
            title: 'Login',
            hasUserErrors: true,
            errors: 'check email address is correct',
        });
    }
});
// This is the register page
app.get('/register', (req, res) => {
    if (!req.session.userID) {
        res.render('register', { title: 'Register' });
    } else {
        res.redirect('/petition');
    }
});
// this is the register post
app.post(
    '/register',
    [
        check('firstName', 'You must enter a first name').notEmpty(),
        check('lastName', 'You must enter a last name').notEmpty(),
        check('email', 'Make sure this is a valid email')
            .notEmpty()
            .normalizeEmail(),
        check('password', 'Check password is more than 6 characters').isLength(
            '6'
        ),
    ],
    async (req, res) => {
        // This is error handling during Registration
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('register', {
                title: 'Register',
                hasErrors: true,
                errors: errors.array(),
            });
        } else {
            const { firstName, lastName, email } = req.body;
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.body.password, salt);
            console.log(firstName, lastName, email, password);
            try {
                const userID = await db.newUser(
                    firstName,
                    lastName,
                    email,
                    password
                );
                req.session.userID = userID.rows[0].user_id;
                res.redirect('/profile');
            } catch (error) {
                console.log(error);
                res.render('register', {
                    title: 'Register',
                    hasDBError: true,
                    errors:
                        'We are having some technical problems, try again later',
                });
            }
        }
    }
);
// This is the get request for profile
app.get('/profile', (req, res) => {
    if (!req.session.userID) {
        res.redirect('/register');
    } else {
        res.render('profile', {
            layout: 'logged',
            title: 'Profile',
        });
    }
});
// This is the Post user profile page
app.post('/profile', async (req, res) => {
    let { age, city, url } = req.body;
    age === '' ? (age = null) : age;
    const userId = req.session.userID;
    if (url.startsWith('https://') || url.startsWith('http://') || url === '') {
        try {
            await db.addUserDetails(age, city, url, userId);
            res.redirect('/petition');
        } catch (error) {
            console.log(age, city, url);
            res.render('profile', {
                layout: 'logged',
                title: 'Profile',
                hasErrors: true,
                errors:
                    'We are having some technical problems, try again later',
            });
        }
    } else {
        res.render('profile', {
            layout: 'logged',
            title: 'Profile',
            hasErrors: true,
            errors: 'Make sure this is a valid URL',
        });
    }
});
// Will check if the user has signed or not
app.get('/petition', async (req, res) => {
    if (!req.session.userID) {
        res.redirect('/register');
    } else {
        const signed = await db.checkSignature(req.session.userID);
        if (signed.rows.length !== 0) {
            res.redirect('/thanks');
        } else res.render('petition', { layout: 'logged', title: 'Petition' });
    }
});
// This is the post petition
app.post(
    '/petition',
    [
        check('signature', 'Field must be fully signed before moving on')
            .isDataURI()
            .isLength('3000'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('petition', {
                layout: 'logged',
                hasUserSigErrors: true,
                errors: errors.array(),
            });
        } else {
            try {
                const { signature } = req.body;
                const userId = req.session.userID;
                await db.addSigner(userId, signature);
                res.redirect('/thanks');
            } catch (error) {
                res.render('petition', {
                    layout: 'logged',
                    title: 'Petition',
                    hasDBErrors: true,
                    errors:
                        'We are having some technical problems, try again later',
                });
            }
        }
    }
);
// THANK YOU Page
app.get('/thanks', async (req, res) => {
    if (req.session.userID) {
        const signed = await db.checkSignature(req.session.userID);
        if (signed.rows.length === 0) {
            res.redirect('/petition');
        } else {
            try {
                const [result, total, user] = await Promise.all([
                    db.getSignee(req.session.userID),
                    db.viewTotal(),
                    db.userDetails(req.session.userID),
                ]);
                res.render('thanks', {
                    layout: 'logged',
                    title: 'Thank You',
                    result: result.rows[0],
                    total: total.rows[0].count,
                    user: user.rows[0],
                });
            } catch (error) {
                res.render('thanks', {
                    layout: 'logged',
                    title: 'Thank You',
                    hasDBErrors: true,
                    errors:
                        'We are having some technical problems, try again later',
                });
            }
        }
    } else {
        res.redirect('/register');
    }
});

// this is the signature deletion
app.post('/thanks', async (req, res) => {
    try {
        await db.deleteSignature(req.session.userID);
        res.redirect('/petition');
    } catch (error) {
        res.render('thanks', {
            layout: 'logged',
            title: 'thanks',
            hasDBErrors: true,
            errors: 'We are having some technical problems, try again later',
        });
    }
});

// This is the signers page
app.get('/signers', async (req, res) => {
    try {
        const signed = await db.checkSignature(req.session.userID);
        if (req.session.userID && signed.rows.length !== 0) {
            const [result, total] = await Promise.all([
                db.getSigners(),
                db.viewTotal(),
            ]);
            res.render('signers', {
                layout: 'logged',
                title: 'Signers',
                result: result.rows,
                total: total.rows[0].count,
            });
        } else {
            res.redirect('/petition');
        }
    } catch (error) {
        res.render('signers', {
            layout: 'logged',
            title: 'Signers',
            hasDBErrors: true,
            errors: 'We are having some technical problems, try again later',
        });
    }
});

// This will filter by city
app.get('/signers/:city', async (req, res) => {
    const { city } = req.params;
    if (req.session.userID) {
        const signed = await db.checkSignature(req.session.userID);
        if (signed.rows.length === 0) {
            res.redirect('/petition');
        } else {
            try {
                const result = await db.filterByCity(city);
                res.render('city', {
                    layout: 'logged',
                    title: city,
                    location: city,
                    result: result.rows,
                });
            } catch (error) {
                res.render('signers', {
                    layout: 'logged',
                    title: city,
                    hasDBErrors: true,
                    errors:
                        'We are having some technical problems, try again later',
                });
            }
        }
    } else {
        res.redirect('/petition');
    }
});
// This wull be the user account page
app.get('/account', async (req, res) => {
    if (!req.session.userID) {
        res.redirect('/petition');
    } else {
        try {
            const UserAccountDetails = await db.UserAccountDetails(
                req.session.userID
            );
            res.render('account', {
                layout: 'logged',
                title: 'Account',
                userAccountDetails: UserAccountDetails.rows[0],
            });
        } catch (error) {
            res.render('signers', {
                layout: 'logged',
                title: 'Account',
                hasDBErrors: true,
                errors:
                    'We are having some technical problems, try again later',
            });
        }
    }
});
// This is the post for account update
app.post('/account', async (req, res) => {
    const userID = req.session.userID;
    try {
        let { firstName, lastName, email, password, age, city, url } = req.body;
        age === '' ? (age = null) : age;
        if (
            url.startsWith('https://') ||
            url.startsWith('http://') ||
            url === ''
        ) {
            if (password === '') {
                const UserAccountDetails = await db.UserAccountDetails(userID);
                password = UserAccountDetails.rows[0].password;
                Promise.all([
                    db.userProfileUpdate(age, city, url, userID),
                    db.userAccountUpdate(
                        firstName,
                        lastName,
                        email,
                        password,
                        userID
                    ),
                ]);
            } else {
                const userID = req.session.userID;
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(password, salt);
                Promise.all([
                    db.userProfileUpdate(age, city, url, userID),
                    db.userAccountUpdate(
                        firstName,
                        lastName,
                        email,
                        hashPassword,
                        userID
                    ),
                ]);
            }
        } else {
            const UserAccountDetails1 = await db.UserAccountDetails(userID);
            res.render('account', {
                layout: 'logged',
                isUpdated: true,
                updateMsg: 'Make sure this is a valid URL',
                userAccountDetails: UserAccountDetails1.rows[0],
            });
            return;
        }
        const UserAccountDetails1 = await db.UserAccountDetails(userID);
        res.render('account', {
            layout: 'logged',
            isUpdated: true,
            updateMsg: 'User Details have been updated',
            userAccountDetails: UserAccountDetails1.rows[0],
        });
    } catch (error) {
        const UserAccountDetails = await db.UserAccountDetails(userID);
        res.render('account', {
            layout: 'logged',
            title: 'Account',
            isUpdated: true,
            userAccountDetails: UserAccountDetails.rows[0],
            updateMsg: 'We are having some technical problems, try again later',
        });
    }
});

// This is the log out process
app.get('/logout', (req, res) => {
    req.session.userID = uuidv4();
    req.session = null;
    setTimeout(() => {
        res.redirect('/');
    }, 1000);
});
// This will be account deletion process
app.get('/delete', (req, res) => {
    res.render('delete', {
        layout: 'logged',
    });
});
// This is the account deletion
app.post('/delete', async (req, res) => {
    const { email, password } = req.body;
    try {
        const AttemptLog = await db.logAttempt(email);
        const match = await compare(password, AttemptLog.rows[0].password);
        const user_id = req.session.userID;
        if (match) {
            const confirm = await Promise.all([
                db.superDelete1(user_id),
                db.superDelete2(user_id),
                db.superDelete3(user_id),
            ]);
            if (confirm) {
                req.session.userID = uuidv4();
                req.session = null;
                setTimeout(() => {
                    res.redirect('/');
                }, 1000);
            }
        } else {
            console.log(match);
            res.render('delete', {
                layout: 'logged',
                title: 'Account',
                hasPwErrors: true,
                errors:
                    "Check password is correct, if you aren't sure contact us",
            });
        }
    } catch (error) {
        res.render('delete', {
            layout: 'logged',
            title: 'Account',
            hasUserErrors: true,
            errors: 'Error on account Delete, contact us',
        });
    }
});
// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});
