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
        firstTrainTime = $("#time-input").val();
        frequency = $("#frequency-input").val().trim();

       

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

        //Getting the info we need from the returned "snapshot"
        var domName = childSnapshot.val().trainName;
        var domDestination = childSnapshot.val().Destination;
        var domfirstTrainTime = childSnapshot.val().firstTrainTime;
        var domFrequency = childSnapshot.val().frequency;

        //initializing vars to calculate next arrival and mins away
        var nextArrival = 0;
        var minutesAway = 0;

        //what time is our user accesing the page?
        var currentHour = moment().format('H');
        var currentMin = moment().format('m');

         //splitting my time into an array so I can access the two values seperately
         var domfirstTrainTime = moment(firstTrainTime, "hh:mm a").format("HH:mm");
        firstTime = firstTrainTime.split(':');
        console.log(firstTime)

        //Calling our hour and min that we pushed into an array above
        var firstHour = firstTime[0];
        var firstMin = firstTime[1];

        //converting hour to minutes
        var current = (currentHour * 60) + parseInt(currentMin);
        var first = (firstHour * 60) + parseInt(firstMin);

        // If the train has already left the station
        if (first < current) {
            minutesAway = (((Math.ceil((current - first) / frequency)) * frequency) + first) - current;
            nextArrival = moment().add(minutesAway, "minutes").format('h:mm A');
        }

        // if the train has not arrived yet
        else {
            minutesAway = first - current;
            nextArrival = moment(firstTrainTime, "HH:mm").format('h:mm A');
        }

        console.log(minutesAway);
        console.log(nextArrival);

        if (minutesAway < 2) {
            alert(domName + " is about to leave!")
        }


        //Pushing to the DOM
        $("#mainTable").append(
            "<tr>" +
            "<td>" + domName + "</td>" +
            "<td>" + domDestination + "</td>" +
            "<td>" + domFrequency + "</td>" +
            "<td>" + nextArrival + "</td>" +
            "<td>" + minutesAway + "</td>" + "</tr>"
        );
        // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
});
