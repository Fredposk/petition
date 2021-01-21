const express = require('express');
const cookieSession = require('cookie-session');
const csurf = require('csurf');
const secrets = require('./secrets.json');
const app = express();
const morgan = require('morgan');
const db = require('./db');
// Rendering middleware
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
// Logging middleware
app.use(morgan('tiny'));
// open sources
app.use(express.static('./public'));
// app.use(express.static(path.join(__dirname, 'public')));
// body-parser
app.use(express.urlencoded({ extended: false }));
// cookie handlers
app.use(
    cookieSession({
        name: 'session',
        keys: [secrets.sessionSecret],
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

// Main homepage will check cookies if none then present petition
app.get('/petition', (req, res) => {
    if (!req.session.signatureId) {
        res.render('petition', {
            title: 'petition',
        });
    } else {
        res.redirect('/thanks');
    }
});

// POST to database
app.post('/petition', async (req, res) => {
    try {
        const { firstName, lastName, signature } = req.body;
        const returnId = await db.addSigner(firstName, lastName, signature);
        req.session.signatureId = returnId.rows[0].contact_id;
        res.redirect('/thanks');
    } catch (e) {
        // IF the db insert fails (i.e. your promise from the db query gets rejected), rerender petition.handlebars and pass an indication that there should be an error message shown to the template
        console.log('error at post');
    }
});

// SIGNERS Page
app.get('/signers', async (req, res) => {
    if (req.session.signatureId) {
        try {
            const [result, total] = await Promise.all([
                db.getSigners(),
                db.viewTotal(),
            ]);
            res.render('signers', {
                title: 'signers',
                result: result.rows,
                total: total,
            });
        } catch (error) {
            // Make an error page 404 etc
            console.log('error during db request');
        }
    } else {
        res.redirect('/petition');
    }
});
// THANK YOU RENDER
app.get('/thanks', async (req, res) => {
    if (req.session.signatureId) {
        try {
            const [result, total] = await Promise.all([
                db.getSignee(req.session.signatureId),
                db.viewTotal(),
            ]);
            res.render('thanks', {
                title: 'Thank You',
                result: result.rows[0],
                total: total.rows[0].count,
                // signature: signature.rows[0].signature,
            });
        } catch (error) {
            // Make an error page 404 etc
            console.log('error during thanks DB request');
        }
    } else {
        res.redirect('/petition');
    }
});

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});
