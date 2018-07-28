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

function isUndefined(param) {
    return (typeof param === "undefined");
};

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

function getSpotify(songTitle) {

    if ( isUndefined(songTitle) ) {
        songTitle = "The Sign";
    }

    clientSpotify.search({ type: 'track', query: songTitle, limit: 1 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        // console.log(JSON.stringify(data, null, 2));
        let items = data.tracks.items;
        items.forEach(elem => {
            // console.log(elem);
            // console.log(JSON.stringify(elem, null, 2));
        })
        console.log("***DEBUG***: songs count:", items.length);
        let song = items[0];
        let artists = song.artists;
        let songArtists;
        artists.forEach(elem => {
            songArtists = (songArtists ? songArtists : "") + "\"" + elem.name + "\" ";
        })
        console.log("Artist(s)", songArtists);
        console.log("Song name: ", song.name);
        let link = song.preview_url;
        if (link === null) {
            link = song.external_urls.spotify;
        }
        console.log("Preview link: ", link);
        console.log("Album: ", song.album.name);
        // console.log(JSON.stringify(song));
    })
}

function getOmdb(movieTitle) {
    const apiKey = 80665998;

    if ( isUndefined(movieTitle) ) {
        movieTitle = "Mr. Nobody";
    }

    let url = "http://www.omdbapi.com/?apikey=" + apiKey + "&t=" + movieTitle.replace(/\s+/g, "+");
    console.log(url);

    request(url, function (error, response, body) {
        // console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log(response);
        console.log(body); // Print the HTML for the Google homepage.
        console.log("Title: ", body["Title"]);
        console.log("Year: ", body.Year);
        console.log("IMDB Rating: ", body.imdbRating);
        // console.log("Rotten Tomatoes Rating: ", body.imdbRating);
        console.log("Country: ", body.Country);
        console.log("Language: ", body.Language);
        console.log("Plot: ", body.Plot);
        console.log("Actors: ", body.Actors);
    });
}

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

getUserInput();

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