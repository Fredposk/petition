const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const db = require('./db');
// Rendering middleware
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
// Logging middleware
app.use(morgan('tiny'));
// open sources
app.use(express.static(path.join(__dirname, 'public')));
// body-parser
app.use(bodyParser.urlencoded({ extended: false }));

// Main homepage will check cookies if none then present petition
app.get('/petition', (req, res) => {
    res.render('petition', {
        title: 'petition',
    });
});

// POST to database
app.post('/petition', async (req, res) => {
    try {
        const { firstName, lastName, signature } = req.body;
        console.log(firstName);
        await db.addSigner(firstName, lastName, signature);
        console.log('signed');
    } catch (e) {
        // IF the db insert fails (i.e. your promise from the db query gets rejected), rerender petition.handlebars and pass an indication that there should be an error message shown to the template
        console.log('error at post');
    }
});

// request to view all signers
app.get('/signers', async (req, res) => {
    try {
        const result = await db.getSigners();
        const total = await db.viewTotal();
        console.log(total.rows);
        console.log(result.rows);
        res.render('signers', {
            title: 'signers',
            result: result.rows,
            total: total,
        });
    } catch (error) {
        // Make an error page 404 etc
        console.log('error during db request');
    }
});

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});
