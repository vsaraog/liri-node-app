"use strict";

require("dotenv").config();
var keys = require("./keys");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var inquirer = require("inquirer");
var fs = require("fs");

var clientSpotify = new Spotify(keys.spotify);
var clientTwitter = new Twitter(keys.twitter);

function getTwitter() {
    var params = { screen_name: 'JohnSmi23366922', count: 20 };
    clientTwitter.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            tweets.forEach(elem => {
                console.log(elem.text);
            });
            //   console.log(tweets);
        } else {
            throw error
        }
    });
}

function getSpotify() {
    clientSpotify.search({ type: 'track', query: 'Baby one more time', limit: 2 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        // console.log(JSON.stringify(data, null, 2));
        let items = data.tracks.items;
        items.forEach(elem => {
            console.log(elem);
            // console.log(JSON.stringify(elem, null, 2));
        })
        // console.log(data);
    })
}

function getOmdb(movieTitle) {
    const apiKey = 80665998;

    movieTitle
    let url = "http://www.omdbapi.com/?apikey=" + apiKey + "&t=" + movieTitle.replace(/\s+/g, "+");
    console.log(url);

    request(url, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log(response);
        // console.log('body:', body); // Print the HTML for the Google homepage.
    });
}

// function getUserInput() {
//     inquirer.prompt([
//         {
//             type: "list",
//             name: "runCommand",
//             message: "Choose command to run",
//             choices: ["my-tweets",
//                 "spotify-this-song",
//                 "movie-this",
//                 "do-what-it-says"]
//         }
//     ])
//         .then(answer => {
//             getInput(answer.runCommand).then(function(response) {
//                 console.log("The response", response);
//             })
//             // console.log("Already at the callee level");
//             // console.log(userInput);
            
//     })
// }

// function getInput(answer) {
//     let message;
//     let userInput;

//     console.log(answer);
//     if (answer === "spotify-this-song") {
//         message = "Enter a song name: ";
//     }
//     else if (answer === "movie-this") {
//         message = "Enter a movie name: "
//     }

//     return new Promise(function(resolve, reject) {
//         if (typeof message !== "undefined") {
//             inquirer.prompt([
//                 {
//                     name: "userInput",
//                     message: message
//                 }
//             ])
//                 .then(input => {
//                     userInput = input.userInput;
//                     console.log("Yay we got the userInput");
//                 })
//         }

//         console.log("Just before last line");
//         resolve = userInput;
//     });
// }

function getRandomSong() {
    fs.readFile("random.txt", function(err, data) {
        if (err) throw err;
    })
}

function getUserInput() {
    const args = process.argv;
    if (args.length < 3) {
        console.log("Enter a valid command");
        return;
    }

    const commandLookup = {
        "my-tweets": getTwitter,
        "spotify-this-song": getSpotify,
        "movie-this": getOmdb
    }
    
    const command = args[2];
    const commandVal = args[3];

    if (typeof commandLookup[command] !== "undefined") {
        commandLookup[command](commandVal);
    }
    else if (command === "do-what-it-says") {
        // getSpotify(getRandomSong());
    }
    else {
        console.log("\"" + command  + "\" is not a valid command" );
    }
}

// getTwitter();
// getSpotify();
// getOmdb("Mr   Nobody");
getUserInput();