/*
    Racing+ Client
    for The Binding of Isaac: Afterbirth+
    (renderer process)
*/

/*

Bugs to fix:
- make it start on the right character in starting room, not just on race start
- finish times are different between clients so add a thing that sends the finish time to everyone on race finish
- make autoscroll less restrictive
- remove double negative on boss cutscenes option
- unlock every easter egg for racing+ save file
- fix sounds so that last place and race completed come as a callback so that both play
- set twitch bot to disable after no mod found
- https://github.com/electron-userland/electron-builder/issues/1095
- make it so that you can see the random thing before you submit the race
- mouseover format and see ruleset in lobby
- enforce version checking upon creating/joining race
- write seed to file so that it works with ctrl+c and ctrl+v
- add tooltips to new race tooltip for all the things
- "duplicate name" tooltip doesn't appear after doing it, going into race, coming back, trying to create again
- make it remember new race settings
- unranked solo doesn't show right icon on lobby
- detect 1million%
- make it so that diversity doesn't give repeat items
- make title column and entrants column in lobby selectable
- add time to lobby for current races
- make spacing slightly smaller for Type and Format on lobby
- split up racing+ logs based on day
- add "Upload log" button
- add # of people to race in prerace

- "Isaac is not open" when it really is - implement hyphen's suggestion
- tooltip for "Entrants" row of lobby gets deleted when coming back from that race
    (probably have to reinit tooltipster every time on enter lobby from race function)
- error while recieving PM during a transition
- clicking profile doesn't work
- clicking from 1 player to the next on the lobby doesn't work, tooltips just need to be rewritten entirely to only have 1 tooltip
- if second place by 1-2 seconds, then NO DUDE play
- re-add changing color on taskbar when new message
- add health column
- server should remember build # and offer no repeats for seeded races
- implement names turning red when left
- !entrants command for twitch bot
- !left command for twitch bot

Features to add:
- test if internet drops during race, what happens? safe resume, https://github.com/joewalnes/reconnecting-websocket
- achievements
- show running time on the lobby of a running race
- automatically sort race table when people move places
- turn different color in lobby when in a race
- add stream to chat map
- update columns for race:
    - time offset
    - fill in items (should also show seed on this screen)
- /shame - Shame on those who haven't readied up.
- volume slider update number better
- wait until raceList before going to lobby so that we can go directly to current race



Features to add (low priority):
- make UI expand horizontally properly
- add items + date to "Top 10 Unseeded Times" leaderboard

Bugs to fix (low priority):
- french race tables rows are not confined to 1 line, so they look bad
- Personnage (french) is too close to character in new-race tooltip
- horizontal scroll bar appears when resizing smaller

*/

'use strict';

// Import NPM packages
const path     = nodeRequire('path');
const execSync = nodeRequire('child_process').execSync;
const remote   = nodeRequire('electron').remote;
const isDev    = nodeRequire('electron-is-dev');
const fs       = nodeRequire('fs-extra');
const tracer   = nodeRequire('tracer');

// Import local modules
const globals         = nodeRequire('./assets/js/globals');
const settings        = nodeRequire('./assets/js/settings');
const misc            = nodeRequire('./assets/js/misc');
const automaticUpdate = nodeRequire('./assets/js/automatic-update');
const localization    = nodeRequire('./assets/js/localization');
const keyboard        = nodeRequire('./assets/js/keyboard');
const steam           = nodeRequire('./assets/js/steam'); // This handles automatic login
const header          = nodeRequire('./assets/js/ui/header');
const tutorialScreen  = nodeRequire('./assets/js/ui/tutorial');
const registerScreen  = nodeRequire('./assets/js/ui/register');
const lobbyScreen     = nodeRequire('./assets/js/ui/lobby');
const raceScreen      = nodeRequire('./assets/js/ui/race');
const modals          = nodeRequire('./assets/js/ui/modals');

/*
    Development-only stuff
*/

if (isDev) {
    // Importing this adds a right-click menu with 'Inspect Element' option
    let rightClickPosition = null;

    const menu = new remote.Menu();
    const menuItem = new remote.MenuItem({
        label: 'Inspect Element',
        click: function() {
            remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y);
        },
    });
    menu.append(menuItem);

    window.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        rightClickPosition = {
            x: e.x,
            y: e.y,
        };
        menu.popup(remote.getCurrentWindow());
    }, false);
}

/*
    Initialization
*/

// Get the version
let packageFileLocation = path.join(__dirname, 'package.json');
let packageFile = fs.readFileSync(packageFileLocation, 'utf8');
let version = 'v' + JSON.parse(packageFile).version;

// Raven (error logging to Sentry)
globals.Raven = nodeRequire('raven');
globals.Raven.config('https://0d0a2118a3354f07ae98d485571e60be:843172db624445f1acb86908446e5c9d@sentry.io/124813', {
    autoBreadcrumbs: true,
    release: version,
    environment: (isDev ? 'development' : 'production'),
    dataCallback: function(data) {
        // We want to report errors to Sentry that are passed to the "errorShow" function
        // But because "captureException" in that function will send us back to this callback, check for that so that we don't report the same error twice
        if (data.exception[0].type !== 'RavenMiscError') {
            misc.errorShow('A unexpected JavaScript error occured. Here\'s what happened:<br /><br />' + JSON.stringify(data.exception), false);
        }
        return data;
    },
}).install();

// Logging (code duplicated between main, renderer, and child processes because of require/nodeRequire issues)
globals.log = tracer.console({
    format: "{{timestamp}} <{{title}}> {{file}}:{{line}} - {{message}}",
    dateformat: "ddd mmm dd HH:MM:ss Z",
    transport: function(data) {
        // #1 - Log to the JavaScript console
        console.log(data.output);

        // #2 - Log to a file
        let logFile = (isDev ? 'Racing+.log' : path.resolve(process.execPath, '..', '..', 'Racing+.log'));
        fs.appendFile(logFile, data.output + (process.platform === 'win32' ? '\r' : '') + '\n', function(err) {
            if (err) {
                throw err;
            }
        });
    }
});

$(document).ready(function() {
    // Version
    $('#title-version').html(version);
    $('#settings-version').html(version);

    // Preload some sounds by playing all of them
    let soundFiles = ['1', '2', '3', 'finished', 'go', 'lets-go', 'quit', 'race-completed'];
    for (let file of soundFiles) {
        let audio = new Audio('assets/sounds/' + file + '.mp3');
        audio.volume = 0;
        audio.play();
    }
    for (let i = 1; i <= 16; i++) {
        let audio = new Audio('assets/sounds/place/' + i + '.mp3');
        audio.volume = 0;
        audio.play();
    }

    // Check to see if we got an error during page initialization
    if (globals.initError !== null) {
        misc.errorShow(globals.initError);
    }
});

/*
    We can't use the "misc.errorShow()" function yet for the following initialization-related stuff because the document is not ready
    So, just store the error in the "globals.initError" variable
*/

// Word list
let wordListLocation = path.join(__dirname, 'assets', 'words', 'words.txt');
fs.readFile(wordListLocation, function(err, data) {
    if (err) {
        globals.initError = 'Failed to read the "' + wordListLocation + '" file: ' + err;
        return;
    }
    globals.wordList = data.toString().split('\n');
});

// Get the default log file location (which is in the user's Documents directory)
// From: https://steamcommunity.com/app/250900/discussions/0/613941122558099449/
if (process.platform === 'win32') { // This will return "win32" even on 64-bit Windows
    // First, try to find their "Documents" folder using PowerShell
    let powershellFailed = false;
    try {
        let command = 'powershell.exe -command "[Environment]::GetFolderPath(\'mydocuments\')"';
        let documentsPath = execSync(command, {
            'encoding': 'utf8',
        });
        documentsPath = $.trim(documentsPath); // Remove the trailing newline
        globals.defaultLogFilePath = path.join(documentsPath, 'My Games', 'Binding of Isaac Afterbirth+', 'log.txt');
        if (fs.existsSync(globals.defaultLogFilePath) === false) {
            powershellFailed = true;
        }
    } catch(err) {
        powershellFailed = true;
    }

    // Executing "powershell.exe" can fail on some computers, so let's try using the "USERPROFILE" environment variable
    if (powershellFailed) {
        let documentsDirNames = ['Documents', 'My Documents'];
        let found = false;
        for (let name of documentsDirNames) {
            let documentsPath = path.join(process.env.USERPROFILE, name);
            if (fs.existsSync(documentsPath)) {
                found = true;
                globals.defaultLogFilePath = path.join(documentsPath, 'My Games', 'Binding of Isaac Afterbirth+', 'log.txt');
                break;
            }
        }
        if (found === false) {
            globals.initError = 'Failed to find your "Documents" directory. Do you have a non-standard Windows installation? Please contact an administrator for help.';
        }
    }

} else if (process.platform === 'darwin') { // OS X
    globals.defaultLogFilePath = path.join(process.env.HOME, 'Library', 'Application Support', 'Binding of Isaac Afterbirth+', 'log.txt');

} else if (process.platform === 'linux') { // Linux
    globals.defaultLogFilePath = path.join(process.env.HOME, '.local', 'share', 'binding of isaac afterbirth+', 'log.txt');

} else {
    globals.initError = 'The platform of "' + process.platform + '" is not supported."';
}
let logFilePath = settings.get('logFilePath');
if (typeof logFilePath === 'undefined' || logFilePath === null) {
    logFilePath = globals.defaultLogFilePath;
    settings.set('logFilePath', globals.defaultLogFilePath);
    settings.saveSync();
    globals.log.info('logFilePath was undefined or null on boot, it was set to: ' + globals.defaultLogFilePath);
}

// Get the default mod directory
let modPath;
if (process.platform === 'win32' || process.platform === 'darwin') {
    modPath = path.join(path.dirname(logFilePath), '..', 'Binding of Isaac Afterbirth+ Mods');
} else if (process.platform === 'linux') {
    // This is lowercase on Linux for some reason
    modPath = path.join(path.dirname(logFilePath), '..', 'binding of isaac afterbirth+ mods');
}
let modPathDev = path.join(modPath, globals.modNameDev);
if (isDev || fs.existsSync(modPathDev) ) {
    globals.modPath = modPathDev; // We prefer to use development directories if they are present, even in production
} else {
    globals.modPath = path.join(modPath, globals.modName);
}

// Store what their R+9/14 character order is
let defaultSaveDatFile = path.join(globals.modPath, 'save-defaults.dat');
for (let i = 1; i <= 3; i++) {
    let modLoaderFile = path.join(globals.modPath, 'save' + i + '.dat');
    if (fs.existsSync(modLoaderFile)) {
        try {
            let json = JSON.parse(fs.readFileSync(modLoaderFile, 'utf8'));
            if (typeof json.order9 === 'undefined') {
                globals.modLoader['order9-' + i] = [0];
            } else {
                globals.modLoader['order9-' + i] = json.order9;
            }
            if (typeof json.order9 === 'undefined') {
                globals.modLoader['order14-' + i] = [0];
            } else {
                globals.modLoader['order14-' + i] = json.order14;
            }
        } catch(err) {
            globals.initError = 'Error while reading the "save' + i + '.dat" file: ' + err;
        }
    } else if (fs.existsSync(defaultSaveDatFile)) {
        // Copy over the default file
        // (this should never occur since fresh save.dat files are delivered with every patch, but handle it just in case)
        try {
            fs.copySync(defaultSaveDatFile, modLoaderFile);
        } catch(err) {
            globals.initError = 'Failed to copy the "save-defaults.dat" file to "' + modLoaderFile + '": ' + err;
        }
        globals.modLoader['order9-' + i] = [0];
        globals.modLoader['order14-' + i] = [0];
    }
}

// Item list
let itemListLocation = path.join(__dirname, 'assets', 'data', 'items.json');
try {
    globals.itemList = JSON.parse(fs.readFileSync(itemListLocation, 'utf8'));
} catch(err) {
    globals.initError = 'Failed to read the "' + itemListLocation + '" file: ' + err;
}

// Trinket list
let trinketListLocation = path.join(__dirname, 'assets', 'data', 'trinkets.json');
try {
    globals.trinketList = JSON.parse(fs.readFileSync(trinketListLocation, 'utf8'));
} catch(err) {
    globals.initError = 'Failed to read the "' + trinketListLocation + '" file: ' + err;
}

// We need to have a list of all of the emotes for the purposes of tab completion
let emotePath = path.join(__dirname, 'assets', 'img', 'emotes');
globals.emoteList = misc.getAllFilesFromFolder(emotePath);
for (let i = 0; i < globals.emoteList.length; i++) { // Remove ".png" from each elemet of emoteList
    globals.emoteList[i] = globals.emoteList[i].slice(0, -4); // ".png" is 4 characters long
}
