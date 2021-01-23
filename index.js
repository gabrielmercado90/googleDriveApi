const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
//   authorize(JSON.parse(content), listFiles);
  // authorize(JSON.parse(content), getFile);
 authorize(JSON.parse(content), uploadFile);
  // authorize(JSON.parse(content), download);
  // authorize(JSON.parse(content), overwrite)
  // authorize(JSON.parse(content), deleteF)
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
    //callback(oAuth2Client, '1kBSaFqY5Zmb6ZlU9OhEIzaiw4ZfQm43J');//get file
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
    const drive = google.drive({ version: 'v3', auth });
    getList(drive, '');
}
function getList(drive, pageToken) {
    drive.files.list({
        corpora: 'user',
        pageSize: 10,
        //q: "name='elvis233424234'",
        pageToken: pageToken ? pageToken : '',
        fields: 'nextPageToken, files(id,name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            console.log('Files:');
            processList(files);
            if (res.data.nextPageToken) {
                getList(drive, res.data.nextPageToken);
            }

            // files.map((file) => {
            //     console.log(`${file.name} (${file.id})`);
            // });
        } else {
            console.log('No files found.');
        }
    });
}
function processList(files) {
    console.log('Processing....');
    files.forEach(file => {
        // console.log(file.name + '|' + file.size + '|' + file.createdTime + '|' + file.modifiedTime);
        console.log(file);
    });
}

function getFile(auth, fileId) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.get({ fileId: fileId, fields: '*' }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        console.log(res.data);
    });
}

function uploadFile(auth) {
    const drive = google.drive({ version: 'v3', auth });
    const folder_id="1rIaRlByc0ANjOGcX-cXJ0_SQQjLQLnJ5"
    var fileMetadata = {
        'name': 'test2.jpg',
        'parents': [folder_id]
    };
    var media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream('test2.jpg')
    };
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, function (err, res) {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            console.log('File Id: ', res.data.id);
        }
    });
}

function download(auth){
    const drive = google.drive({ version: 'v3', auth });
    var dest = fs.createWriteStream("fer2013(2).csv");  // Please set the filename of the saved file.
    drive.files.get(
      {fileId: "1j6HjNEPjD-Gr_lKRjSit1qQNqnMQynWa",alt:"media"},
      {responseType: "stream"},
      (err, {data}) => {
        if (err) {
          console.log(err);
          return;
        }
        data
          .on("end", () => console.log("Done."))
          .on("error", (err) => {
            console.log(err);
            return process.exit();
          })
          .pipe(dest);
      }
    );
}

function overwrite(auth){
  const drive = google.drive({version: 'v3', auth});
  const folder_id="1rIaRlByc0ANjOGcX-cXJ0_SQQjLQLnJ5"
  var fileMetadata = {
    'name': 'fer2013.csv',
    'parents': [folder_id]
  };
  var media = {
    mimeType: 'text/csv',
    body: fs.createReadStream('fer2013.csv')
};
  drive.files.update({
    fileId: '1aogiBVa02Zdd-ojr89VC4Xt4cnE6jggZ',
    resource: fileMetadata,
    media: media
  }, (err, file) => {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('File Id: ', file.id);
    }
  });
}

function deleteF(auth){
  var fileId = '1IswIczSlMn0KMuL_VS1d8f7q5Md8g58R'; // Desired file id to download from  google drive

  const drive = google.drive({ version: 'v3', auth }); // Authenticating drive API

  // Deleting the image from Drive
  drive.files
    .delete({
      fileId: fileId,
    })
    .then(
     function (err, res) {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            console.log('File Id: ', res.data.id);
        }
    }
    );
}