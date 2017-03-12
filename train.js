$(document).ready(function() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBBpMN954ePCvSI3vjrcFhdLbZqk9remQI",
        authDomain: "traintime-20618.firebaseapp.com",
        databaseURL: "https://traintime-20618.firebaseio.com",
        storageBucket: "traintime-20618.appspot.com",
        messagingSenderId: "491152839057"
    };
    firebase.initializeApp(config);

    //getting the current time to display to our page
    var userTime = moment().format('MMM Do YYYY, h:mm:ss a');
    $("#userTime").append(userTime);

    // Create a variable to reference the database
    var database = firebase.database();

    // Initial Values
    var trainName = "";
    var destination = "";
    var frequency = 0;
    var firstTrainTime = 0;
    var firstTime = [];

    // Capture Button Click
    $("#add-train").on("click", function() {

        // Don't refresh the page!
        event.preventDefault();

        // getting our values ready to input in firebase
        trainName = $("#name-input").val().trim();
        destination = $("#destination-input").val().trim();
        firstTrainTime = moment($("#time-input").val().trim(), "HH:mm").format("X");
        frequency = $("#frequency-input").val().trim();

        console.log(firstTrainTime);


        //pushing to the database
        database.ref("/trains").push({
            trainName: trainName,
            Destination: destination,
            firstTrainTime: firstTrainTime,
            frequency: frequency,
            //time user submittedon server time (keeps all stamps on same TZ)
            dateAdded: firebase.database.ServerValue.TIMESTAMP,
        });

        //empty the form
        $("#name-input").val(" ");
        $("#destination-input").val(" ");
        $("#time-input").val(" ");
        $("#frequency-input").val(" ");
    });

    database.ref("/trains").on("child_added", function(childSnapshot) {

        // Store everything into a variable.
        var tName = childSnapshot.val().trainName;
        var tDestination = childSnapshot.val().Destination;
        var tFrequency = childSnapshot.val().frequency;
        var tFirstTrain = childSnapshot.val().firstTrainTime;

        // Calculate the minutes until arrival using hardcore math
        // To calculate the minutes till arrival, take the current time in unix subtract the FirstTrain 
        //time and find the modulus between the difference and the frequency  
        var differenceTimes = moment().diff(moment.unix(tFirstTrain), "minutes");
        var tRemainder = moment().diff(moment.unix(tFirstTrain), "minutes") % tFrequency;
        var tMinutes = tFrequency - tRemainder;

        // To calculate the arrival time, add the tMinutes to the currrent time
        var tArrival = moment().add(tMinutes, "m").format("hh:mm A");

        // if (minutesAway < 2) {
        //     alert(tName + " is about to leave!")
        // }


        //Pushing to the DOM
        $("#mainTable").append(
            "<tr>" +
            "<td>" + tName + "</td>" +
            "<td>" + tDestination + "</td>" +
            "<td>" + tFrequency + "</td>" +
            "<td>" + tArrival + "</td>" +
            "<td>" + tMinutes + "</td>" + "</tr>"
        );
        // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
});
