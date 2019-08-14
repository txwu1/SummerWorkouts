var express = require('express');
var router = express.Router();

let checkIfLoggedIn = function(req, res, next){
    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    if (!user){
        console.log("User Not Logged In");
        res.status('400').send({error: "Not Logged In"});
    } else {
        console.log("User logged in");
        next();
    }
};

/*
    POST REQUESTS
*/
router.get('/user/getPosts', checkIfLoggedIn, function(req, res){
    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    let uid = user.uid;
    let dbRef = getDBRef();
    let page = parseInt(req.query.page);
    let start = 0;
    if (isNaN(page)){
        // err
    } else if (page < 0){
        // err
    } else {
        start = (page - 1) * 10;
    }

    let queries = [];
    queries.push(dbRef.collection("Posts/" + uid + "/workouts").get());
    queries.push(dbRef.collection("Posts/" + uid + "/updates").get());
    Promise.all(queries)
    .then(querySnapshots => {
        return querySnapshots.map(qs => qs.docs).reduce((acc, docs) => [...acc, ...docs]);
    })
    .then(docs => {
        docs.sort(getWorkoutsCompareFunc).reverse();
        let docsInRange = docs.slice(start, start + 10);
        let returnObj = [];
        let WorkoutGetter = require("../models/workouts").WorkoutGetter;
        let UpdateGetter = require("../models/updates").UpdateGetter;
        docsInRange.forEach(function(doc){
            let obj = doc.ref.parent.id == "workouts" ? new WorkoutGetter(doc.id, doc.data()) :new UpdateGetter(doc.id, doc.data());
            returnObj.push(obj);
        });
        res.status('200').send({data: returnObj});
    })
    .catch(err => {
        console.log(err);
        res.status('400').send({error: "Error getting posts"});
    });

});

/* 
    WORKOUT REQUESTS
*/
router.post('/user/addWorkout', checkIfLoggedIn, function(req, res){
    // TODO validate data
    let workoutType = req.body.workoutType;
    let date = req.body.datepicker;
    let time = req.body.timeHour + ":" + req.body.timeMinute + " " + req.body.timeAMPM;
    let description = req.body.description;
    let completed = (req.body.completed == "true");

    let currJSONDate = new Date().toJSON();
    let currDate = currJSONDate.slice(5,10)+ "-" + currJSONDate.slice(0,4);
    console.log(currDate);

    // Create model
    let Workout = require('../models/workouts').Workout;
    let data = new Workout(workoutType, date, time, description, currDate, completed).toJSON;
    console.log(data);
    //
    let dbRef = getDBRef();
    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    let uid = user.uid;

    let userRef = dbRef.collection("Posts/" + uid + "/" + "workouts");

    userRef.add(data)
        .then(ref => {
            let totalWorkoutsRef = dbRef.doc("Posts/" + uid);
            let fvRef = require('../app').admin.firestore.FieldValue;
            let workoutRef = ref.id;
            totalWorkoutsRef.update({
                totalWorkouts: fvRef.increment(1)
            }).then(ref => {
                console.log("workout total updated");
                res.status('200').send({success: true});
            }).catch(err => {
                console.log("workout total update failed");
                console.log(err);
                userRef.doc(workoutRef).delete();
                res.status('400').send({error: "Error adding workout"});
            });
        })
        .catch(err => {
            console.log(err);
            res.status('400').send({error: "Error adding workout"});
        })
});

router.get('/user/getWorkouts', checkIfLoggedIn, function(req, res){
    // check what type of workout query
    let paginate = (req.query.paginate == "true");

    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    let uid = user.uid;
    let dbRef = getDBRef();
    let start = 0;

    if (paginate){
        let page = parseInt(req.query.page);
        if (isNaN(page)){
            // err
        } else if (page < 0){
            // err
        } else {
            start = (page - 1) * 10;
        }
    }

    let query = dbRef.collection("Posts/" + uid + "/workouts");
    query.get().then(qs => {
        let docs = qs.docs;
        docs.sort(getWorkoutsCompareFunc).reverse();
        let docsInRange = paginate ? docs.slice(start, start + 10) : docs;
        let returnObj = []
        let WorkoutGetter = require("../models/workouts").WorkoutGetter;
        docsInRange.forEach(function(doc){
            returnObj.push(new WorkoutGetter(doc.id, doc.data()));
        });
        res.status('200').send({data: returnObj});
    }).catch(err => {
        // error
        console.log("error getting all workouts");
        console.log(err);
        res.status('400').send({error: err});
    });
    

});


router.get('/user/getSelectWorkouts', checkIfLoggedIn, function(req, res){
    // check what type of workout query
    let completed =  (req.query.completed == "true");
    let paginate = (req.query.paginate == "true");

    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    let uid = user.uid;
    let dbRef = getDBRef();
    let start = 0;

    if (paginate){
        let page = parseInt(req.query.page);
        if (isNaN(page)){
            // err
        } else if (page < 0){
            // err
        } else {
            start = (page - 1) * 10;
        }
    }

    let query = dbRef.collection("Posts/" + uid + "/workouts").where("completed", "==", completed);
    query.get().then(qs => {
        let docs = qs.docs;
        docs.sort(getWorkoutsCompareFunc).reverse();
        let docsInRange = paginate ? docs.slice(start, start + 10) : docs;
        let returnObj = []
        let WorkoutGetter = require("../models/workouts").WorkoutGetter;
        docsInRange.forEach(function(doc){
            returnObj.push(new WorkoutGetter(doc.id, doc.data()));
        });
        res.status('200').send({data: returnObj});
    }).catch(err => {
        // error
        console.log("error getting docs");
        res.status('400').send({error: err});
    });
    

});

router.patch("/user/updateWorkout", checkIfLoggedIn, function(req, res){
    // get data
    console.log("starting patch");
    let postID = req.body.postID;
    let unparsedData = req.body.data;

    let workoutType = unparsedData.workoutType;
    let date = unparsedData.datepicker;
    let time = unparsedData.timeHour + ":" + unparsedData.timeMinute + " " + unparsedData.timeAMPM;
    let description = unparsedData.description;
    let completed = (unparsedData.completed == "true");

    let currJSONDate = new Date().toJSON();
    let currDate = currJSONDate.slice(5,10)+ "-" + currJSONDate.slice(0,4);

    // Create model
    let Workout = require('../models/workouts').Workout;
    let data = new Workout(workoutType, date, time, description, currDate, completed).toJSON;

    let dbRef = getDBRef();
    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    let uid = user.uid;

    let updateDoc = dbRef.collection("Posts/" + uid + "/workouts").doc(postID).set(data, {merge: true})
    .then(writeResult => {
        console.log("update successful");
        res.status('200').send({success: true});
    })
    .catch(err => {
        console.log("error updating workout");
        res.status('400').send({error: err});
    });
});

router.post("/user/deleteWorkout", checkIfLoggedIn, function(req, res){
    let postID = req.body.postID;

    let dbRef = getDBRef();
    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    let uid = user.uid;

    let deleteDoc = dbRef.collection("Posts/" + uid + "/workouts").doc(postID).delete()
    .then(writeResult => {
        let totalWorkoutsRef = dbRef.doc("Posts/" + uid);
        let fvRef = require('../app').admin.firestore.FieldValue;
        totalWorkoutsRef.update({
            totalWorkouts: fvRef.increment(-1)
        }).then(ref => {
            console.log("workout total updated");
            res.status('200').send({success: true});
        }).catch(err => {
            console.log(err);
            res.status('400').send({error: "Error decrementing workout"});
        });
    })
    .catch(err => {
        console.log(err);
        res.status('400').send({error: err});
    });
});

/*
    UPDATE REQUESTS
*/

router.post("/user/addUpdate", checkIfLoggedIn, function(req, res){
    // TODO validate data
    let date = req.body.datepicker;
    let description = req.body.description;

    let currJSONDate = new Date().toJSON();
    let currDate = currJSONDate.slice(5,10)+ "-" + currJSONDate.slice(0,4);
    console.log(currDate);

    // Create model
    let Update = require('../models/updates').Update;
    let data = new Update(date, description, currDate).toJSON;
    console.log(data);
    //
    let dbRef = getDBRef();
    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    let uid = user.uid;

    let userRef = dbRef.collection("Posts/" + uid + "/" + "updates");

    userRef.add(data)
    .then(ref => {
        console.log("update added");
        res.status('200').send({success: true});
    })
    .catch(err => {
        console.log(err);
        res.status('400').send({error: "Error adding update"});
    })
});

router.get('/user/getUpdates', checkIfLoggedIn, function(req, res){
    // check what type of workout query
    let paginate = (req.query.paginate == "true");

    let firebase = require("../app").firebase;
    let user = firebase.auth().currentUser;
    let uid = user.uid;
    let dbRef = getDBRef();
    let start = 0;

    if (paginate){
        let page = parseInt(req.query.page);
        if (isNaN(page)){
            // err
        } else if (page < 0){
            // err
        } else {
            start = (page - 1) * 10;
        }
    }

    let query = dbRef.collection("Posts/" + uid + "/updates");
    query.get().then(qs => {
        let docs = qs.docs;
        docs.sort(getWorkoutsCompareFunc).reverse();
        let docsInRange = paginate ? docs.slice(start, start + 10) : docs;
        let returnObj = []
        let UpdateGetter = require("../models/updates").UpdateGetter;
        docsInRange.forEach(function(doc){
            returnObj.push(new UpdateGetter(doc.id, doc.data()));
        });
        res.status('200').send({data: returnObj});
    }).catch(err => {
        // error
        console.log("error getting all updates");
        console.log(err);
        res.status('400').send({error: err});
    });
    

});



module.exports = router;

let getDBRef  = function(){
    let adminRef = require('../app').admin;
    return adminRef.firestore();
};

let tsRef  = function(){
    let adminRef = require('../app').admin;
    return adminRef.firestore.Timestamp;
};

let getWorkoutsCompareFunc = function(first, second){
    let firstDate = new Date(first.get('date'));
    let secondDate = new Date(second.get('date'));
    let firstTime = first.get('time') == null ? "12:00 AM" : first.get('time');
    let secondTime = second.get('time') == null ? "12:00 AM" : second.get('time');
    let firstHours = parseInt(firstTime.split(":")[0]) + firstTime.split(":")[1].split(" ")[1] == 'PM' ? 12 : 0;
    firstDate.setHours(firstHours);
    firstDate.setMinutes(firstTime.split(":")[1].slice(0, 2));

    let secondHours = parseInt(secondTime.split(":")[0]) + secondTime.split(":")[1].split(" ")[1] == 'PM' ? 12 : 0;
    secondDate.setHours(secondHours);
    secondDate.setMinutes(secondTime.split(":")[1].slice(0, 2));

    if (firstDate > secondDate){
        return 1;
    } else if (firstDate < secondDate){
        return -1;
    } else {
        return 0;
    }
};


/*

dbRef.doc("workouts/" + uid).listCollections()
        .then(arrCollections => {
            let queries = [];
            console.log("getting queries");
            arrCollections.forEach(function(collection){
                queries.push(dbRef.collection("workouts/" + uid + "/" + collection.id).orderBy('date').get());
            });
            console.log("starting promise.all");
            Promise.all(queries)
            .then(querySnapshots => {
                return querySnapshots.map(qs => qs.docs).reduce((acc, docs) => [...acc, ...docs]);
            })
            .then(docs => {
                docs.sort(getWorkoutsCompareFunc).reverse();
                let docsInRange = docs.slice(start, start + 10);
                let returnObj = []
                let WorkoutGetter = require("../models/workouts").WorkoutGetter;
                docsInRange.forEach(function(doc){
                    returnObj.push(new WorkoutGetter(doc.id, doc.data()));
                });
                res.status('200').send({data: returnObj});
            })
            .catch(err => {
                console.log("error getting docs in promise.all");
                res.status('400').send({error: "Error getting workout"});
            });
        })
        .catch(err => {
            // error
            console.log("error getting docs");
            res.status('400').send({error: err});
        });

*/