let revealWorkoutForm = function(){
    $("#workoutForm").css("display", "block");
    $("#updateForm").css("display", "none");
};

let closeWorkoutForm = function(){
    $("#workoutForm").css("display", "none");
    $("#errMsg").find("#errMsgInner").remove();
    document.getElementById("addWorkoutForm").reset();
};

let workoutTypes = ["strength", "cardio", "mixed", "other"];

let addWorkout = function(){
    let workoutType = $("#workoutType").val();
    let date = $("#datepicker").datepicker("getDate");
    let hour = $("#timeHour").val();
    let minute = $("#timeMinute").val();
    let AMPM = $("#timeAMPM").val();
    let description = $("#description").val();
    let completed = $("#workoutCompleteCB").prop("checked");

    if (!(workoutTypes.includes(workoutType))){
        postErrorMessage("Choose a valid Workout Type");
        return;
    }

    if (date == null){
        postErrorMessage("Choose a date");
        return;
    }

    if (!(hour == "" && minute == "")){
        let err = false;
        // if something entered in hour or minute, all must be filled
        if (hour == "" || minute == "" || AMPM == ""){
            err = true;
        }
        
        // ensure hour and minute are numbers
        if (isNaN(parseInt(hour)) || isNaN(parseInt(minute))){
            err = true;
        }

        // ensure entries are within range
        if (parseInt(hour) > 12 || parseInt(hour) < 1
            || parseInt(minute) > 59 || parseInt(minute) < 0
            || !(["AM", "PM"].includes(AMPM))){
            err = true;
        }
        if (err){
            postErrorMessage("Enter a valid time");
            return;
        }
    } else {
        hour = 0;
        minute = 0;
        AMPM = "AM";
    }

    if ((typeof completed) != "boolean"){
        postErrorMessage("Checkbox input is invalid. Please reload the form.");
        return;
    }

    // create key/value object to send
    let data = 
    {
        workoutType: workoutType,
        datepicker: date,
        timeHour: hour,
        timeMinute: minute,
        timeAMPM: AMPM,
        description: description,
        completed: completed

    };

    // ajax request
    $.ajax({
        url: "/user/addWorkout",
        method: "POST",
        data: data,
        success: function(resData, status, jqXHR){
            // reset form
            postSuccessMessage();
            $("#postHistReload").click();
        },
        error: function(jqXHR, status, errorThrown){
            postErrorMessage(errorThrown);
        }
    });

};

let postErrorMessage = function(err){
    console.log(err);
    $("#errMsg").find("#errMsgInner").remove();
    let errMsgDiv = $("#errMsg");
    let innerContent = "<div id=\"errMsgInner\" class=\"container\"><div class=\"text-center border align-items-center my-2\">" +
                        "<p class=\"my-auto py-2\"><i class=\"fas fa-exclamation-circle pr-2\"></i>" +
                        err + "</p></div></div>";
    errMsgDiv.append(innerContent);
};

let postSuccessMessage = function(){
    console.log("success");

    // remove any error messages and clear form
    $("#errMsg").find("#errMsgInner").remove();
    document.getElementById("addWorkoutForm").reset();
};

let changeToEdit = function(target){
    let postID = $(target).parent().parent().parent().children()[0].value;
    let workoutType = $(target).parent().parent().parent().children()[1].innerText.split(" ")[1];
    let workoutDate = $(target).parent().parent().parent().children()[2].innerText.split(": ")[1];
    let workoutTime = $(target).parent().parent().parent().children()[3].innerText.split(" ").slice(1).join(" ");
    let workoutDescription = $(target).parent().parent().parent().children()[4].innerText.split(" ")[1];
    let completed = $(target).parent().parent().parent().children()[5].innerText.split(" ")[2] == "Yes" ? true : false;



    let originalWorkout =
    {
        postID: postID,
        workoutType: workoutType,
        date: workoutDate,
        time: workoutTime,
        description: workoutDescription,
        completed: completed
    };

    originalWorkouts.set(postID, originalWorkout);

    // clear message box
    $("#" + postID + "-msgContainer").toggleClass("container");
    $("#" + postID + "-msgContainer").html("");

    // different border to emphasize state
    $(target).parent().parent().parent().parent().toggleClass("border-warning");
    $(target).parent().parent().parent().parent().toggleClass("border-5");
    
    // change divs into input
    $(target).parent().parent().parent().children().first().next().replaceWith(
        "<div class=\"form-group mb-1\">" +
            "<label for=\"workoutType-" + postID + "\">Select Workout Type:</label>" +
            "<select class=\"form-control display-ib w-auto ml-2\" name=\"workoutType-" + postID + "\" id=\"workoutType-" + postID + "\">" +
                "<option value=\"strength\">Strength</option>" +
                "<option value=\"cardio\">Cardio</option>" +
                "<option value=\"mixed\">Mixed</option>" +
                "<option value=\"other\">Other</option>" +
            "</select>" +
        "</div>"
    );

    $("#workoutType-" + postID).val(workoutType);


    $(target).parent().parent().parent().children().eq(2).replaceWith(
        "<div class=\"form-group mb-1\">" +
            "<div class=\"mt-2\">" +
                "<label for=\"datepicker-" + postID + "\" class=\"mr-2\">Date:</label>" +
                "<input type=\"text\" id=\"datepicker-" + postID + "\" name=\"datepicker-" + postID + "\" class=\"form-control display-ib w-auto\" placeholder=\"MM/DD/YYYY\">" +
            "</div>" +
            "<div class=\"mt-2\">" +
                "<label class=\"mr-2\">Time (Optional):</label>" +
                "<div class=\"display-ib\">"+
                    "<input type=\"text\" class=\"form-control w-80 text-center display-ib\" name=\"timeHour-" + postID + "\" id=\"timeHour-" + postID + "\" placeholder=\"HH\" maxlength=\"2\"/>" +
                    "<span class=\"px-1 display-ib\">:</span>" +
                    "<input type=\"text\" class=\"form-control w-80 text-center display-ib\" id=\"timeMinute-" + postID + "\" name=\"timeMinute-" + postID + "\" placeholder=\"MM\" maxlength=\"2\"/>" +
                    "<select class=\"form-control w-80 display-ib\" name=\"timeAMPM-" + postID + "\" id=\"timeAMPM-" + postID + "\">" +
                        "<option value=\"AM\">AM</option>" +
                        "<option value=\"PM\">PM</option>" +
                    "</select>" +
                "</div>" +
            "</div>" +
        "</div>"
    );
    $("#datepicker-" + postID).datepicker();
    $("#datepicker-" + postID).datepicker("setDate", new Date(workoutDate));
    $("#timeHour-" + postID).val(workoutTime.split(":")[0]);
    $("#timeMinute-" + postID).val(workoutTime.split(":")[1].split(" ")[0]);
    $("#timeAMPM-" + postID).val(workoutTime.split(":")[1].split(" ")[1]);

    $(target).parent().parent().parent().children().eq(3).remove();
    $(target).parent().parent().parent().children().eq(3).replaceWith(
        "<div class=\"form-group\"></div>"
    );

    let descriptionHTML = $("#addWorkoutForm").children().eq(2).html();
    let newDescriptionHTML = descriptionHTML.replace(/description/g, "description-" + postID)
                                            .replace("Description of Workout", "Description of Workout:");
    $(target).parent().parent().parent().children().eq(3).html(newDescriptionHTML);
    $(target).parent().parent().parent().children().eq(3).children().last().val(workoutDescription);

    $(target).parent().parent().parent().children().eq(4).replaceWith(
        "<div class=\"form-check pl-0\">" +
            "<label class=\"form-check-label\" for=\"workoutCompleteCB-" + postID + "\">" +
                "Workout Completed?" +
            "</label>" +
            "<input class=\"form-check-input ml-2\" type=\"checkbox\" value=\"completed\" id=\"workoutCompleteCB-" + postID + "\">" +
        "</div>"
    );
    if (completed){
        $("#workoutCompleteCB-" + postID).prop("checked", "true");
    }


    // buttons
    let i = $(target)[0].id.substr(2);

    $(target).parent().children().first().next().replaceWith(
        "<button type=\"button\" id=\"cancel-" + postID + "\" class=\"btn btn-danger ml-2 w-47 workoutEditCancel\">Cancel</button>"
    );

    $(target).parent().children().first().next().click(function(event){
        changeToView(event);
    });

    $(target).parent().children().first().replaceWith(
        "<button type=\"button\" id=\"update-" + postID + "\" class=\"btn btn-success mr-2 w-47 workoutEditSubmit\">Submit</button>"
    );

    $("#update-" + postID).click(function(event){
        event.preventDefault();
        updateWorkout(event);
    });

};

let changeToView = function(event){
    let target = event.target;
    let i = $(target)[0].id.substr(2);

    let postID = $(target).parent().parent().parent().children()[0].value;
    let originalData = originalWorkouts.get(postID);
    originalWorkouts.delete(postID);

    // clear message box
    $("#" + postID + "-msgContainer").toggleClass("container");
    $("#" + postID + "-msgContainer").html("");

    /* Change border back */
    $(target).parent().parent().parent().parent().toggleClass("border-warning");
    $(target).parent().parent().parent().parent().toggleClass("border-5");

    $(target).parent().parent().parent().append(
        "<div class=\"row mx-auto\"><p>Type: " + originalData.workoutType + "</p></div>" +
        "<div class=\"row mx-auto\"><p>Date: " + originalData.date + "</p></div>" +
        "<div class=\"row mx-auto\"><p>Time: " + originalData.time + "</p></div>" + 
        "<div class=\"row mx-auto\"><p>Description: " + originalData.description + "</p></div>" +
        "<div class=\"row mx-auto\"><p>Workout Complete? " + ((originalData.completed == true) ? "Yes" : "No") + "</p></div>" + 
        "<div class=\"row mt-3 mx-auto\">" + 
            "<div class=\"mw-100 mx-auto\">" + 
            "<button type=\"button\" id=\"e1" + i + "\" class=\"btn btn-success mr-2 w-80 workoutEdit\">Edit</button>" +
            "<button type=\"button\" id=\"e2" + i + "\" class=\"btn btn-danger ml-2 w-80 workoutDelete\">Delete</button>" +
            "</div>" +
        "</div>"
    );

    let selector = $(target).parent().parent().parent();

    $(target).parent().parent().parent().children().first().next().remove();
    $(target).parent().parent().parent().children().first().next().remove();
    $(target).parent().parent().parent().children().first().next().remove();
    $(target).parent().parent().parent().children().first().next().remove(); 
    $(target).parent().parent().parent().children().first().next().remove(); 

    selector.children().eq(6).children().first().children().first().click(function(event){
        event.preventDefault();
        changeToEdit(event.target);

    });

    selector.children().eq(6).children().first().children().first().next().click(function(event){
        event.preventDefault();
        confirmDeleteWorkout(event.target);
    });
};

let updateWorkout = function(event){
    let target = event.target;
    var updateFormSelector = $(target).parent().parent().parent();
    let postID = updateFormSelector.children().first().val();

    let workoutType = $("#workoutType-" + postID).val();
    let date = $("#datepicker-" + postID).datepicker("getDate");
    let hour = $("#timeHour-" + postID).val();
    let minute = $("#timeMinute-" + postID).val();
    let AMPM = $("#timeAMPM-" + postID).val();
    let description = $("#description-" + postID).val();
    let completed = $("#workoutCompleteCB-" + postID).prop("checked");

    let objData = 
    {
        workoutType: workoutType,
        datepicker: date,
        timeHour: hour,
        timeMinute: minute,
        timeAMPM: AMPM,
        description: description,
        completed: completed

    };

    let data =
    {
        postID: postID,
        data: objData
    };

    // ajax request
    $.ajax({
        url: "/user/updateWorkout",
        method: "PATCH",
        data: data,
        success: function(resData, status, jqXHR){
            updateSuccess(updateFormSelector);

        },
        error: function(jqXHR, status, errorThrown){
            console.log(errorThrown);
            updateError(updateFormSelector, errorThrown);
        }
    });

};

let updateSuccess = function(formSelector){
    let postID = formSelector.children().first().val();

    let workoutType = $("#workoutType-" + postID).val();
    let date = $("#datepicker-" + postID).datepicker("getDate");
    let hour = $("#timeHour-" + postID).val();
    let minute = $("#timeMinute-" + postID).val();
    let AMPM = $("#timeAMPM-" + postID).val();
    let description = $("#description-" + postID).val();
    let completed = $("#workoutCompleteCB-" + postID).prop("checked");

    let updatedWorkout =
    {
        postID: postID,
        workoutType: workoutType,
        date: date,
        time: hour + ":" + minute + " " + AMPM,
        description: description,
        completed: completed
    };

    originalWorkouts.delete(postID);
    originalWorkouts.set(postID, updatedWorkout);
    $("#cancel-" + postID).click();


    let msgContainer = $("#" + postID + "-msgContainer");
    let successHTML = "<div class=\"text-center border align-items-center my-2\">" +
                    "<p class=\"my-auto py-2\"><i class=\"fas fa-check pr-2 color-green\"></i>" +
                    "Update Successful!" + "</p></div>";
    msgContainer.html(successHTML);
    $(msgContainer).toggleClass("container");
};

let updateError = function(formSelector, err){
    let postID = formSelector.children().first().val();
    let msgContainer = $("#" + postID + "-msgContainer");
    let errorHTML = "<div class=\"text-center border align-items-center my-2\">" +
                    "<p class=\"my-auto py-2\"><i class=\"fas fa-exclamation-circle pr-2\"></i>" +
                    err + "</p></div>";
    msgContainer.html(errorHTML);
    $(msgContainer).toggleClass("container");
};

let confirmDeleteWorkout = function(target){
    let postID = $(target).parent().parent().parent().children()[0].value;
    let workoutType = $(target).parent().parent().parent().children()[1].innerText.split(" ")[1];
    let workoutDate = $(target).parent().parent().parent().children()[2].innerText.split(": ")[1];
    let workoutTime = $(target).parent().parent().parent().children()[3].innerText.split(" ").slice(1).join(" ");
    let workoutDescription = $(target).parent().parent().parent().children()[4].innerText.split(" ")[1];
    let completed = $(target).parent().parent().parent().children()[5].innerText.split(" ")[2];


    $(".modal-body").html(
            "<input id=\"modalWorkoutID\" type=\"hidden\" value=\"" + postID + "\">" +
            "<div class=\"mx-3\"><p class=\"my-2\">Type: " + workoutType + "</p></div>" +
            "<div class=\"mx-3\"><p class=\"my-2\">Date: " + workoutDate + "</p></div>" +
            "<div class=\"mx-3\"><p class=\"my-2\">Time: " + workoutTime + "</p></div>" + 
            "<div class=\"mx-3\"><p class=\"my-2\">Description: " + workoutDescription + "</p></div>" +
            "<div class=\"mx-3\"><p>Workout Complete? " + completed + "</p></div>"
    );
    $('#deleteModal').modal('show');
    $(".deleteWorkout").click(function(event){
        deleteWorkout(event.target);
    });
/*
    $("#deleteModal").on("shown.bs.modal", function(e){
        console.log("1");
        console.log($(".modal-backdrop").slice(1));
        $(".modal-backdrop").slice(1).remove();
    });*/

};

let deleteWorkout = function(target){
    let postID = $(target).parent().parent().children().eq(1).children()[0].value;

    let data =
    {
        postID: postID,
    };
    
    $.ajax({
        url: "/user/deleteWorkout",
        method: "POST",
        data: data,
        success: function(resData, status, jqXHR){
            // postSuccessMessage
            console.log("delete successful");
            // reload history
            $("#postHistReload").click();
        },
        error: function(jqXHR, status, errorThrown){
            // postErrorMessage
            console.log(errorThrown);
        }
    });
};

var originalWorkouts = new Map();

/* ADDING UPDATES */
let revealUpdateForm = function(){
    $("#updateForm").css("display", "block");
    $("#workoutForm").css("display", "none")
};

let closeUpdateForm = function(){
    $("#updateForm").css("display", "none");
    $("#update-errMsg").find("#update-errMsgInner").remove();
    document.getElementById("addUpdateForm").reset();
};

let addUpdate = function(){
    let date = $("#update-datepicker").datepicker("getDate");
    let description = $("#update-description").val();

    if (date == null){
        postUpdateErrorMessage("Choose a date");
        return;
    }

    if (description == ""){
        postUpdateErrorMessage("Please enter text into the description box.");
        return;
    }

    // create key/value object to send
    let data = 
    {
        datepicker: date,
        description: description,

    };

    // ajax request
    $.ajax({
        url: "/user/addUpdate",
        method: "POST",
        data: data,
        success: function(resData, status, jqXHR){
            // reset form
            postUpdateSuccessMessage();
        },
        error: function(jqXHR, status, errorThrown){
            postUpdateErrorMessage(errorThrown);
        }
    });

};

let postUpdateErrorMessage = function(err){
    console.log(err);
    $("#update-errMsg").find("#update-errMsgInner").remove();
    let errMsgDiv = $("#update-errMsg");
    let innerContent = "<div id=\"update-errMsgInner\" class=\"container\"><div class=\"text-center border align-items-center my-2\">" +
                        "<p class=\"my-auto py-2\"><i class=\"fas fa-exclamation-circle pr-2\"></i>" +
                        err + "</p></div></div>";
    errMsgDiv.append(innerContent);
};

let postUpdateSuccessMessage = function(){
    // remove any error messages and clear form
    $("#update-errMsg").find("#update-errMsgInner").remove();
    document.getElementById("addUpdateForm").reset();

    // have success message
    let errMsgDiv = $("#update-errMsg");
    let innerContent = "<div id=\"update-errMsgInner\" class=\"container\"><div class=\"text-center border align-items-center my-2\">" +
                        "<p class=\"my-auto py-2\"><i class=\"fas fa-check color-green pr-2\"></i>" +
                        "Update Successfully Added" + "</p></div></div>";
    errMsgDiv.append(innerContent);
};


$(document).ready(function(revealWorkoutForm, closeWorkoutForm,
                            addWorkout, postErrorMessage, postSuccessMessage,
                            changeToEdit, changeToView, confirmDeleteWorkout, originalWorkouts,
                            updateWorkout, updateSuccess, updateError, deleteWorkout) {
    // setup datepickers
    $("#datepicker").datepicker();
    $("#update-datepicker").datepicker();

    /* */

});