var express = require('express');
var app = express();
var cors = require('cors');

var bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cors({origin:true, credentials: true}));

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

var a = "a";
var b = "b";
var c = 'c';

// Load client secrets from a local file.
function run() {
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), postFeedback);
  })
};

app.get('/run', function(request, response){
    run();
    response.send("successfully run!");
})

app.post('/setValues', function(request, response){

    
    a = request.body.a;
    b = request.body.b;
    c = request.body.c;

    response.send("Values set to " + a + ' ' + b + ' ' + c);
    console.log("Values set to " + request.body.a + ' \n' + request.body.b + ' \n' + request.body.c);
    console.log("Received: " + request.body);
    run();
});

app.get('/getValues', function(request, response){
    response.send(a + ' ' + b + ' ' + c);
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        callback(oauth2Client);
      }
    });
  }
  
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   *
   * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback to call with the authorized
   *     client.
   */
  function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        callback(oauth2Client);
      });
    });
  }
  
  /**
   * Store token to disk be used in later program executions.
   *
   * @param {Object} token The token to store to disk.
   */
  function storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
  }
  
  /**
   * (Previously) Print the names and majors of students in a sample spreadsheet:
   * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   */
  function postFeedback(auth) {
    var sheets = google.sheets('v4');
    // var spreadsheetId = '1PJ2-YpQVGbBbE4OxV0sVmifbrN3t5PM-EO46HPJxCt4';
    // var range = 'A2:C';
    // var numOfRows = sheets.spreadsheets.values.get(spreadsheetId,range);
    // console.log(numOfRows);
  
    sheets.spreadsheets.get({
      auth: auth,
      spreadsheetId: '1PJ2-YpQVGbBbE4OxV0sVmifbrN3t5PM-EO46HPJxCt4',
      includeGridData: true
    }, function (err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
      } else {
        var last_row = response.sheets[0].data[0].rowData.length;
        console.log(last_row);
        sheets.spreadsheets.values.update({
          auth: auth,
          spreadsheetId: '1PJ2-YpQVGbBbE4OxV0sVmifbrN3t5PM-EO46HPJxCt4',
          range: 'A'+String(last_row + 1)+':C',
          valueInputOption: 'USER_ENTERED',
          resource: {range: 'A'+String(last_row + 1)+':C',
                     majorDimension: 'ROWS',
                     values: [[''+a+'',''+b+'',''+c+'']]}
        }, function(err, response) {
          if (err) {
            console.log('The API returned an error: ' + err);
            return;
          }
          var rows = response.updatedRows;
          if (rows == 0) {
            console.log('No rows updated.');
          } else {
            console.log('Successfully updated');
          }
        });
      }
    });
  }

app.listen(4000);
console.log("Server running on port 4000");