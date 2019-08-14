let getPosts = function(pageNum){
    console.log(pageNum);
    let data = 
    {
        page: pageNum,
        paginate: true
    }
    $.ajax({
        url: "/user/getPosts",
        method: "GET",
        data: data,
        success: function(resData, status, jqXHR){
        // update display
        updateDisplay("#postsDisplay", resData);
        },
        error: function(jqXHR, status, errorThrown){
        getPostsErrorMessage(errorThrown);
        }
    });
};

let getWorkouts = function(pageNum){
    console.log(pageNum);
    let data = 
    {
        page: pageNum,
        paginate: true
    }
    $.ajax({
        url: "/user/getWorkouts",
        method: "GET",
        data: data,
        success: function(resData, status, jqXHR){
        // update display
        updateDisplay("#workoutsDisplay", resData);
        },
        error: function(jqXHR, status, errorThrown){
        getPostsErrorMessage(errorThrown);
        }
    });
};

let getUpdates = function(pageNum){
    console.log(pageNum);
    let data = 
    {
        page: pageNum,
        paginate: true
    }
    $.ajax({
        url: "/user/getUpdates",
        method: "GET",
        data: data,
        success: function(resData, status, jqXHR){
        // update display
        updateDisplay("#updatesDisplay", resData);
        },
        error: function(jqXHR, status, errorThrown){
        getPostsErrorMessage(errorThrown);
        }
    });
};

let updateDisplay = function(target, dataObj){
    let display = $(target);
    console.log(dataObj);
    let data = dataObj.data;
    display.html("");
    data.forEach(function(obj){
        if (obj.postType == "WORKOUT"){
            addWorkoutToDisplay(display, obj.id, obj.data);
        } else {
            addUpdateToDisplay(display, obj.id, obj.data);
        }
    });
    $(".workoutEdit").click(function(event){
        event.preventDefault();
        //changeToEdit(event.target);

    });

    $(".workoutDelete").click(function(event){
        event.preventDefault();
        //confirmDeleteWorkout(event.target);
    });
    if (data.length < 10){
        display.next().children().eq(1).children().first().children().last().prop("disabled", "true");
    }
};

let addWorkoutToDisplay = function(target, id, workout){
    target.append("<div class=\"container-fluid card-body border rounded mt-2\">" +
                            "<div id=\"" + id + "-msgContainer\"></div>" +
                            "<form class=\"mx-2 mt-2\">" + 
                            "<input type=\"hidden\" value=\"" + id + "\">" +
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
};

let addUpdateToDisplay = function(target, id, update){
    target.append("<div class=\"container-fluid card-body border rounded mt-2\">" +
                        "<div id=\"" + id + "-msgContainer\"></div>" +
                        "<form class=\"mx-2 mt-2\">" + 
                            "<input type=\"hidden\" value=\"" + id + "\">" +
                            "<div class=\"row mx-auto  workoutDataItem\"><p>Date: " + update.date + "</p></div>" +
                            "<div class=\"row mx-auto workoutDataItem\"><p>Description: " + update.description + "</p></div>" +
                            "<div class=\"row mt-3 mx-auto\">" + 
                                "<div class=\"mw-100 mx-auto\">" + 
                                    "<button type=\"button\" class=\"btn btn-success mr-2 w-80 workoutEdit\">Edit</button>" +
                                    "<button type=\"button\" class=\"btn btn-danger ml-2 w-80 workoutDelete\">Delete</button>" +
                                "</div>" +
                            "</div>" +
                        "</form>" +
                    "</div>");
};

let getPostsErrorMessage = function(err){
    console.log(err);
};

/* Handling Tab Interactions */
let tabs = ["all posts", "workouts", "updates"];

let switchTabs = function(event){
    let target = $(event.target);
    let tabText = target.text().toLowerCase();
    let tabIndex = tabs.indexOf(tabText);

    $(".active").toggleClass("active");
    target.parent().toggleClass("active");
    
    $(".tab-active").toggleClass("tab-active");
    $("#data-container").children().eq(tabIndex).toggleClass("tab-active");
    if ($("#data-container").children().eq(tabIndex).hasClass("uninitialized")){
        $("#data-container").children().eq(tabIndex).toggleClass("uninitialized");
        if (tabIndex == 1){
            getWorkouts(1);
        } else if (tabIndex == 2){
            getUpdates(1);
        }
    }
}


$(document).ready(function() {

    /*
        Posts Tab
    */
    $("#tab-posts").click(function(event){switchTabs(event);});
    $("#tab-workouts").click(function(event){switchTabs(event);});
    $("#tab-updates").click(function(event){switchTabs(event);});


    /*
        Post History Pagination 
    */

    let nextPage = function(event){
        let target = $(event.target);

        let prev = target.parent().children().first();
        if (prev.prop("disabled")){
            prev.prop("disabled", false);
        }

        let pageNumSelector = target.parent().children().first().next().children().first();
        let pageNum = parseInt(pageNumSelector.text().split(" ")[1]);
        pageNumSelector.text("Page " + (pageNum + 1));
        //getWorkouts(pageNum + 1);
    };
    $(".log-next").click(function(event){nextPage(event);});

    let prevPage = function(event){
        let target = $(event.target);

        let next = target.parent().children().last();
        if (next.prop("disabled")){
            next.prop("disabled", false);
        }

        let pageNumSelector = target.parent().children().first().next().children().first();
        let pageNum = parseInt(pageNumSelector.text().split(" ")[1]);
        pageNumSelector.text("Page " + (pageNum - 1));
        if ((pageNum - 1) <= 1){
            target.prop("disabled", true);
        }
        //getWorkouts(pageNum - 1);
    };

    $(".log-prev").click(function(event){prevPage(event);});

    getPosts(1);

    //
    $("#postHistReload").click(function(){
        //getPosts(1);
    });
});