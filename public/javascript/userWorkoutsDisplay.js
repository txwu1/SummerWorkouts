import {Workout} from "/Views/workouts.js";

$(document).ready(function() {

    let getWorkouts = function(pageNum){
        console.log(pageNum);
        let data = 
        {
            page: pageNum,
            completed: false,
            paginate: true
        }
        $.ajax({
            url: "/user/getSelectWorkouts",
            method: "GET",
            data: data,
            success: function(resData, status, jqXHR){
            // update display
            updateWorkoutsDisplay(resData);
            },
            error: function(jqXHR, status, errorThrown){
            getWorkoutsErrorMessage(errorThrown);
            }
        });
    };

    let updateWorkoutsDisplay = function(dataObj){
        let display = $("#workoutDisplay");
        console.log(dataObj);
        let data = dataObj.data;
        display.html("");
        data.forEach(function(obj){
            let workout = obj.data;
            display.append("<div class=\"container-fluid card-body border rounded mt-2\">" +
                                "<div id=\"" + obj.id + "-msgContainer\"></div>" +
                                "<form class=\"mx-2 mt-2\">" + 
                                "<input type=\"hidden\" value=\"" + obj.id + "\">" +
                                "<div class=\"row mx-auto workoutDataItem\"><p>Type: " + workout.workoutType + "</p></div>" +
                                "<div class=\"row mx-auto  workoutDataItem\"><p>Date: " + workout.date + "</p></div>" +
                                "<div class=\"row mx-auto workoutDataItem\"><p>Time: " + workout.time + "</p></div>" + 
                                "<div class=\"row mx-auto workoutDataItem\"><p>Description: " + workout.description + "</p></div>" +
                                "<div class=\"row mx-auto\"><p>Workout Complete? " + ((workout.completed == true) ? "Yes" : "No") + "</p></div>" + 
                                "<div class=\"row mt-3 mx-auto\">" + 
                                    "<div class=\"mw-100 mx-auto\">" + 
                                        "<button type=\"button\" class=\"btn btn-success mr-2 w-80 workoutEdit\">Edit</button>" +
                                        "<button type=\"button\" class=\"btn btn-danger ml-2 w-80 workoutDelete\">Delete</button>" +
                                    "</div>" +
                                "</div>" +
                                "</form>" +
                            "</div>");
        });

        $(".workoutEdit").click(function(event){
            event.preventDefault();
            changeToEdit(event.target);
    
        });
    
        $(".workoutDelete").click(function(event){
            event.preventDefault();
            confirmDeleteWorkout(event.target);
        });
    };

    let getWorkoutsErrorMessage = function(err){
        console.log(err);
    };

    // testing ui with test data without accessing db
    let updateWorkoutsDisplay2 = function(data){
        let display = $("#workoutDisplay");
        data.forEach(function(workout, i){
        display.append("<div class=\"container-fluid card-body border rounded mt-2\">" +
                            "<form class=\"mx-2 mt-2\">" + 
                            "<input type=\"hidden\" value=\"" + i + "\">" +
                            "<div class=\"row mx-auto\"><p>Type: " + workout.workoutType + "</p></div>" +
                            "<div class=\"row mx-auto\"><p>Date: " + workout.date + "</p></div>" +
                            "<div class=\"row mx-auto\"><p>Time: " + workout.time + "</p></div>" + 
                            "<div class=\"row mx-auto\"><p>Description: " + workout.description + "</p></div>" +
                            "<div class=\"row mx-auto\"><p>Workout Complete? " + ((workout.completed == true) ? "Yes" : "No") + "</p></div>" + 
                            "<div class=\"row mt-3 mx-auto\">" + 
                                "<div class=\"mw-100 mx-auto\">" + 
                                "<button type=\"button\" id=\"e3" + i + "\" class=\"btn btn-success mr-2 w-80 workoutEdit\">Edit</button>" +
                                "<button type=\"button\" id=\"e4" + i + "\" class=\"btn btn-danger ml-2 w-80 workoutDelete\">Delete</button>" +
                                "</div>" +
                            "</div>" +
                            "</form>" +
                        "</div>")
        });

        $(".workoutEdit").click(function(event){
            event.preventDefault();
            changeToEdit(event.target);
    
        });
    
        $(".workoutDelete").click(function(event){
            event.preventDefault();
            confirmDeleteWorkout(event.target);
        });
    };
    
    let data = [new Workout("strength","Sat Jul 27 2019 00:00:00 GMT-0700 (Pacific Daylight Time)", "1:23 AM", "OK1", "2"),
                new Workout("strength","Sat Jul 27 2019 00:00:00 GMT-0700 (Pacific Daylight Time)", "1:10 AM", "OK2", "1", true),
                new Workout("strength","Sat Jul 28 2019 00:00:00 GMT-0700 (Pacific Daylight Time)", "5:10 AM", "OK2", "3")    
            ];

    //updateWorkoutsDisplay2(data);

    /*
        Post History Pagination 
    */

    let nextPage = function(){
        if ($("#prev").prop("disabled")){
            $("#prev").prop("disabled", false);
        }
        let pageNum = parseInt($("#pageNum").text().split(" ")[1]);
        $("#pageNum").text("Page " + (pageNum + 1));
        getWorkouts(pageNum + 1);
    };
    $("#next").click(nextPage);

    let prevPage = function(){
        let pageNum = parseInt($("#pageNum").text().split(" ")[1]);
        $("#pageNum").text("Page " + (pageNum - 1));
        if ((pageNum - 1) <= 1){
            $("#prev").prop("disabled", true);
        }
        getWorkouts(pageNum - 1);
    };

    $("#prev").click(prevPage);

    getWorkouts(1);

    //
    $("#postHistReload").click(function(){
        getWorkouts(1);
    });
});