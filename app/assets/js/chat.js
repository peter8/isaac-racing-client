/*
    Chat functions
*/

'use strict';

// Imports
const ipcRenderer = nodeRequire('electron').ipcRenderer;
const globals     = nodeRequire('./assets/js/globals');
const misc        = nodeRequire('./assets/js/misc');

exports.send = function(destination) {
    // Don't do anything if we are not on the screen corresponding to the chat input form
    if (destination === 'lobby' && globals.currentScreen !== 'lobby') {
        return;
    } else if (destination === 'race' && globals.currentScreen !== 'race') {
        return;
    }

    // Get values from the form
    let message = document.getElementById(destination + '-chat-box-input').value.trim();

    // Do nothing if the input field is empty
    if (message === '') {
        return;
    }

    // Truncate messages longer than 150 characters (this is also enforced server-side)
    if (message.length > 150) {
        message = message.substring(0, 150);
    }

    // Erase the contents of the input field
    $('#' + destination + '-chat-box-input').val('');

    // Get the room
    let room;
    if (destination === 'lobby') {
        room = 'lobby';
    } else if (destination === 'race') {
        room = '_race_' + globals.currentRaceID;
    }

    // Add it to the history so that we can use up arrow later
    globals.roomList[room].typedHistory.unshift(message);

    // Reset the history index
    globals.roomList[room].historyIndex = -1;

    /*
        Commands
    */

    if (message === '/debug') {
        // /debug - Debug command
        misc.debug();
    } else if (message === '/finish') {
        // /finish - Debug finish
        globals.conn.emit('raceFinish', {
            'id': globals.currentRaceID,
        });
    } else if (message === '/restart') {
        // /restart - Restart the client
        ipcRenderer.send('asynchronous-message', 'restart');
    } else if (message.match(/^\/msg .+? .+/)) {
        // /msg - Private message
        let m = message.match(/^\/msg (.+?) (.+)/);
        let name = m[1];
        message = m[2];
        globals.conn.emit('privateMessage', {
            'name': name,
            'message': message,
        });

        // We won't get a message back from the server if the sending of the PM was successful, so manually call the draw function now
        draw('PM-to', name, message);
    } else {
        globals.conn.emit('roomMessage', {
            'room': room,
            'message':  message,
        });
    }
};

const draw = function(room, name, message, datetime = null) {
    // Check for the existence of a PM
    let privateMessage = false;
    if (room === 'PM-to') {
        room = globals.currentScreen;
        privateMessage = 'to';
    } else if (room === 'PM-from') {
        room = globals.currentScreen;
        privateMessage = 'from';
    }

    // Keep track of how many lines of chat have been spoken in this room
    globals.roomList[room].chatLine++;

    // Sanitize the input
    message = misc.htmlEntities(message);

    // Check for emotes and insert them if present
    message = fillEmotes(message);

    // Get the hours and minutes from the time
    let date;
    if (datetime === null) {
        date = new Date();
    } else {
        date = new Date(datetime);
    }
    let hours = date.getHours();
    if (hours < 10) {
        hours = '0' + hours;
    }
    let minutes = date.getMinutes();
    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    // Construct the chat line
    let chatLine = '<div id="' + room + '-chat-text-line-' + globals.roomList[room].chatLine + '" class="hidden">';
    chatLine += '<span id="' + room + '-chat-text-line-' + globals.roomList[room].chatLine + '-header">';
    chatLine += '[' + hours + ':' + minutes + '] &nbsp; ';
    if (privateMessage !== false) {
        chatLine += '<span class="chat-pm">[PM ' + privateMessage + ' <strong class="chat-pm">' + name + '</strong>]</span> &nbsp; ';
    } else {
        chatLine += '&lt;<strong>' + name + '</strong>&gt; &nbsp; ';
    }
    chatLine += '</span>';
    chatLine += message;
    chatLine += '</div>';

    // Find out if we should automatically scroll down after adding the new line of chat
    let autoScroll = false;
    let bottomPixel = $('#' + room + '-chat-text').prop('scrollHeight') - $('#' + room + '-chat-text').height();
    if ($('#' + room + '-chat-text').scrollTop() === bottomPixel) {
        // If we are already scrolled to the bottom, then it is ok to automatically scroll
        autoScroll = true;
    }

    // Add the new line
    let destination;
    if (room === 'lobby') {
        destination = 'lobby';
    } else if (room.startsWith('_race_')) {
        destination = 'race';
    } else {
        misc.errorShow('Failed to parse the room in the "chat.draw" function.');
    }
    if (datetime === null) {
        $('#' + destination + '-chat-text').append(chatLine);
    } else {
        // We prepend instead of append because the chat history comes in order from most recent to least recent
        $('#' + destination + '-chat-text').prepend(chatLine);
    }
    $('#' + room + '-chat-text-line-' + globals.roomList[room].chatLine).fadeIn(globals.fadeTime);

    // Set indentation for long lines
    if (room === 'lobby') {
        let indentPixels = $('#' + room + '-chat-text-line-' + globals.roomList[room].chatLine + '-header').css('width');
        $('#' + room + '-chat-text-line-' + globals.roomList[room].chatLine).css('padding-left', indentPixels);
        $('#' + room + '-chat-text-line-' + globals.roomList[room].chatLine).css('text-indent', '-' + indentPixels);
    }

    // Automatically scroll
    if (autoScroll) {
        bottomPixel = $('#' + room + '-chat-text').prop('scrollHeight') - $('#' + room + '-chat-text').height();
        $('#' + room + '-chat-text').scrollTop(bottomPixel);
    }
};
exports.draw = draw;

function fillEmotes(message) {
    // Get a list of all of the emotes
    let emoteList = misc.getAllFilesFromFolder(__dirname + '/../img/emotes');

    // Chop off the .png from the end of each element of the array
    for (let i = 0; i < emoteList.length; i++) {
        emoteList[i] = emoteList[i].slice(0, -4); // ".png" is 4 characters long
    }

    // Search through the text for each emote
    for (let i = 0; i < emoteList.length; i++) {
        if (message.indexOf(emoteList[i]) !== -1) {
            let emoteTag = '<img class="chat-emote" src="assets/img/emotes/' + emoteList[i] + '.png" alt="' + emoteList[i] + '" />';
            let re = new RegExp('\\b' + emoteList[i] + '\\b', 'g'); // "\b" is a word boundary in regex
            message = message.replace(re, emoteTag);
        }
    }

    return message;
}