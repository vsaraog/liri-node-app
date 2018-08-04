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

const COMMAND_LOOKUP = {
    "my-tweets": getTwitter,
    "spotify-this-song": getSpotify,
    "movie-this": getOmdb
}

function isUndefined(param) {
    return (typeof param === "undefined");
};

function getTwitter() {
    var params = { screen_name: 'JohnSmi23366922', count: 20 };
    clientTwitter.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
    		let i = 0;
            tweets.forEach(elem => {
                console.log("Tweet #" + ++i + ": ", elem.text);
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
//        console.log("***DEBUG***: songs count:", items.length);
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
//    console.log(url);

    function getRatings(ratings) {
        let imdbRating, rottenRating;
        for (let i = 0;
            (i < ratings.length) && 
                (isUndefined(imdbRating) || isUndefined(rottenRating));
            ++i) {
            let elem = ratings[i];
            if (elem.Source.toLowerCase().indexOf("internet movie database") != -1) {
                imdbRating = elem.Value;
            }
            else if (elem.Source.toLowerCase().indexOf("rotten") != -1) {
                rottenRating = elem.Value;
            }
        }
        return {imdb: imdbRating, rotten: rottenRating};
    }

    request(url, function (error, response, bodyStr) {
        // console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log(response);
        //console.log(bodyStr); // Print the HTML for the Google homepage.
        // console.log("Body type: ", typeof body);
        const body = JSON.parse(bodyStr);
        console.log("Title: ", body["Title"]);
        console.log("Year: ", body.Year);
        const ratings = getRatings(body.Ratings);
        console.log("IMDB Rating: ", ratings.imdb);
        console.log("Rotten Tomatoes Rating: ", ratings.rotten);
        console.log("Country: ", body.Country);
        console.log("Language: ", body.Language);
        console.log("Plot: ", body.Plot);
        console.log("Actors: ", body.Actors);
    });
}

function getRandomCommand() {
    fs.readFile("random.txt", "utf8", function(err, data) {
        if (err) throw err;
        // console.log(typeof data);
        const lines = data.split("\n");
        //console.log(lines);

        let command;
        let commandVal;
        let i = 0;
        // Find the first line which is not commented out
        // and extract the command and argument from that line
        while (i < lines.length) {
            let pos = lines[i].indexOf(",");
            let isArgGiven = (pos !== -1);
            command = lines[i].substring(0, (isArgGiven ? pos : lines[i].length) );
            // If argument given assign it to commandVal
            if (isArgGiven) {
                commandVal = lines[i].substring(pos + 1);
            }
            // lines starting with # is taken as commented out line
            if (command.indexOf("#") != 0) {
                break;
            }
            ++i;
         }

        if ( !isUndefined(COMMAND_LOOKUP[command]) ) {
            COMMAND_LOOKUP[command](commandVal);
        }
        else {
            console.log("The command \"" + command + "\" in file is not valid");
        }
    })
}

function getUserInput() {
    const args = process.argv;
    if (args.length < 3) {
        console.log("Enter a valid command");
        return;
    }
    
    const command = args[2];
    const commandVal = args[3];

    if (typeof COMMAND_LOOKUP[command] !== "undefined") {
        COMMAND_LOOKUP[command](commandVal);
    }
    else if (command === "do-what-it-says") {
        getRandomCommand();
    }
    else {
        console.log("\"" + command  + "\" is not a valid command" );
    }
}

getUserInput();

// VIK_TODO: Try to figure out how to work async with
// inquirer
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
