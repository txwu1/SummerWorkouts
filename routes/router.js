var express = require('express');
var router = express.Router();


let logOutCurrUser = function(req, res, next){

    let firebase = require("../app").firebase;
    let currUser = getCurrUser();
    if (currUser){
        firebase.auth().signOut();
    }
    next();
};

let validateCreateUserData = function(req, res, next){
    if (req.body.username.length < 1 
        || req.body.email.length < 6
        || req.body.password.length < 6){
        res.redirect('/setup' + "?error=true");
    } else {
        next();
    }

};

router.get('/', function(req, res, next){
    res.render('home',
    {
        title: 'ZipLog',
    });
});

router.get('/login', function(req, res, next){
    let currUser = getCurrUser();
    if (currUser){
        res.redirect('/user' + "?isLoggedIn=true");
    } else {
        let error = req.query.error == 'true' ? true : false;
        res.render('login',
        {
            title: 'ZipLog | Login',
            error: error
        });
    }
});

router.post('/login/auth', function(req, res, next){
    let firebase = require("../app").firebase;
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
        .then(function(userCredential){
            res.redirect('/user');
        })
        .catch(function(error){
            res.redirect('/login?error=true');
        });
});

router.get('/setup', function(req, res, next){
    let error = req.query.error == 'true' ? true : false;
    res.render('createAccount',
    {
        title: 'ZipLog | Create Account',
        error: error
    });
});

router.post('/setup/createUser', validateCreateUserData, logOutCurrUser, function(req, res, next){
    let auth = require('../scripts/auth');
    let admin = require('../app').admin;
    let userConfig = auth.createUserConfig(req.body.email, req.body.password, req.body.username);
    
    admin.auth().createUser(userConfig)
        .then(function(userRecord) {

            let adminRef = require('../app').admin;
            let dbRef = adminRef.firestore();
            let postRef = dbRef.collection('Posts').doc(userRecord.uid);
            let setWithOptions = postRef.set({}, {merge: true});
            
            let temp = getCurrUser();
            if (temp){
                res.redirect('/user');
            } else {
                res.redirect('/login');
            }
        })
        .catch(function(error) {
            next(error);
        });
});

router.get('/user', function(req, res, next){
    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    if (user) {
        let isLoggedIn = req.query.isLoggedIn == "true" ? true : false; 
        res.render('user',
        {
            title: 'ZipLog | ' + user.displayName,
            isLoggedIn: isLoggedIn,
            displayName: user.displayName,
            layout: 'ziplog'
        });
    } else{
        var err = new Error('Please login to see your user information');
        err.status = 403;
        next(err);
    }
});

router.get('/log', function(req, res, next){
    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    if (user) {
        let isLoggedIn = req.query.isLoggedIn == "true" ? true : false; 
        res.render('mainlog',
        {
            title: 'ZipLog | ' + user.displayName,
            isLoggedIn: isLoggedIn,
            displayName: user.displayName,
            layout: 'ziplog'
        });
    } else{
        var err = new Error('Please login to see your user information');
        err.status = 403;
        next(err);
    }
});

router.get('/logout', function(req, res, next){
    let firebase = require("../app").firebase;
    firebase.auth().signOut()
    .then(function(){
        res.redirect('/');
    })
    .catch(function(error){
        console.log(error);
        next(error);
    });
});

module.exports = router;

let getCurrUser = function(){
    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;

    return user ? user : false;
};
