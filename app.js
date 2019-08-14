const dotenv = require('dotenv').config();
var express = require('express');
var exphs = require('express-handlebars');

var app = express();

var admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        "projectId": process.env.PROJECT_ID,
        "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
        "clientEmail": process.env.CLIENT_EMAIL
    }),
    databaseURL: process.env.DATABASE_URL
});

var fb = require('firebase');

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

fb.initializeApp(firebaseConfig);

app.engine('handlebars', exphs());
app.set('view engine', 'handlebars');

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

var dbRoutes = require('./routes/databaseRouter');
app.use('/', dbRoutes);

var routes = require('./routes/router');
app.use('/', routes);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});



module.exports = {
                    app: app,
                    admin: admin,
                    firebase: fb
                };