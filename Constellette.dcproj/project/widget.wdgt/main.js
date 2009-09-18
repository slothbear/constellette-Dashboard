var VERSION = "1.1.4";  // also change in widget prefs & back panel

var INDICATOR_OFF = 0;
var INDICATOR_GREEN = 1;
var INDICATOR_YELLOW = 2;
var INDICATOR_RED = 3;

var PASSWORD_MASK = "••••••••••";
var SHOW_PASSWORD = true ;  // not a logic puzzle
var HIDE_PASSWORD = false ; // these "aid readability" of postData()

// back panel fields
var rsw_id;
var rsw_game;
var debug_log;

// front panel fields
var rsw_game_display;

// global holding spot until someone pays for encryption
var rsw_plaintext_password;

function retrievePrefs() {
    var idPref = widget.preferenceForKey("rswID");
    if (idPref) {
        rsw_id.value = idPref;
    }

    var gamePref = widget.preferenceForKey("rswGameName");
    if (gamePref) {
        rsw_game.value = gamePref;              // back panel
        rsw_game_display.innerText = gamePref;  // front panel
    }

    var pwPref = widget.preferenceForKey("rswPassword");
    if (pwPref) {
        rsw_plaintext_password = pwPref;
        // display password as ••dots so it can't be seen.  haha.
        passwordField.value = PASSWORD_MASK;
    }
}

function stowPrefs() {
    widget.setPreferenceForKey(rsw_id.value, "rswID");
    widget.setPreferenceForKey(rsw_game.value, "rswGameName");
    rsw_game_display.innerText = rsw_game.value;  // front panel

    // Password is displayed as ••dots, don't overwrite
    var pwValue = passwordField.value;
    if (pwValue == PASSWORD_MASK) return;
    widget.setPreferenceForKey(pwValue, "rswPassword");
    rsw_plaintext_password = pwValue;

    if (pwValue.length == 0) return;
    passwordField.value = PASSWORD_MASK;
}

function updateOutstanding() {
    if (0 == rsw_id.value.length
        || 0 == rsw_game.value.length
        || 0 == rsw_plaintext_password) {
        setStatus("Please fill in id, password, and game on the back.");
        statusIndicator.object.setValue(INDICATOR_OFF);
        return;
    }

    setStatus("... updating ...");
    statusIndicator.object.setValue(INDICATOR_YELLOW);
    retrieveGameStatus(postData(SHOW_PASSWORD));
}

function retrieveGameStatus(postDataString) {
    $.ajax({
        type: "POST",
        url: "https://rswgame.com/xml",
        cache: false,
        processData: false,
        data: postDataString,
        success: function(data) { processGames(data); },
        complete: function(xhr, s) { debug_log = xhr.responseText;},
        error: function (xhr, status, errt) { setErrorStatus(status); },
        timeout: 10000,
        contentType: "text/xml",
        dataType: "xml"
    });

//    var mock_response = "<?xml version='1.0' encoding='utf-8'?><response><gameHeader gameId='northern6i' numWaitingFor='6' state='active'/></response>";
//    processGames(mock_response);
//    debug_log = mock_response;
//    return;
}

function postData(showPassword) {
    return "<?xml version='1.0'?>" +
        "<request command='list'>" +
        "<parameter keyword='accountId' value='" +
        rsw_id.value + "' />" +
        "<parameter keyword='password' value='" +
        (showPassword ? rsw_plaintext_password : "[HIDDEN]")
        + "' />" +
        "<parameter keyword='onlyMine' value='true' />" +
        "<parameter keyword='format' value='xml' />" +
        "<parameter keyword='active' value='false' />" +
        "</request>";
}

function processGames(game_xml) {
    var rgame = rsw_game.value;

    // overall error with the request?
    var errFound = false;
    $(game_xml).find("response").each(function() {
       var resp = $(this);
       if (resp.attr("error") == "True") {
          errFound = true;
          var errs = $(resp).text().trim();
          setErrorStatus(errs);
       }
    });
    if (errFound) return;
    
    // query succeeded -- find status of game we're tracking
    var gameFound = false;
    $(game_xml).find("gameHeader").each(function() {
        var header = $(this);
        if (header.attr("gameId") == rgame) {
            // if found, we're not parked in the red zone
            gameFound = true;
            statusIndicator.object.setValue(INDICATOR_GREEN);
            turnsDisplay.innerText = "0";

            var state = header.attr("state");
            if (state == "completed") {
                setStatus("game over");
            }
            else if (state == "pending") {
                setStatus("not started yet");
            }
            else if (state == "active") {
                turnsDisplay.innerText = header.attr("numWaitingFor");
                setStatus("");
            }
            else {
                setErrorStatus("unknown state: " + state);
            }
        }
    });

    if (!gameFound) {
        setErrorStatus("game not found");
    }
}

function setStatus(msg) {
    statusMessage.innerText = msg;
}

function setErrorStatus(msg) {
    setStatus(msg + " (use 'mail log' on back)");
    statusIndicator.object.setValue(INDICATOR_RED);
}

//
// buttons and things that take us outside
//

function clickDebug(event) {
    front_display =
        "version: " + VERSION +
        "\ngame: " + rsw_game.value +
        "\nwaiting: " + turnsDisplay.innerText +
        "\nred/green indicator: " + statusIndicator.object.value +
        "\nstatus message: " + statusMessage.innerText;
    widget.openURL("mailto:bugs@constella.org?subject=Constellete log&body=Please describe what happened:\n\n\n" +
        front_display + "\n\n" +
        postData(HIDE_PASSWORD) + "\n\n" +  // get request w/o password
        debug_log);
}

function clickFeedback(event) {
    showFront();
    widget.openURL("http://constella.uservoice.com/");
}

function myGames(event) {
    widget.openURL("https://rswgame.com/listMyActive");
}


function goToConstelletteSite(event) {
    widget.openURL("http://constella.org");
}

// utility functions
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

//
// standard widget lifecycle functions
//

// called by <body> element onload event when the widget is ready to start
function load() {
    dashcode.setupParts();

    // back panel
    rsw_id = document.getElementById("idField");
    rsw_game = document.getElementById("gameField");

    // front panel
    rsw_game_display = document.getElementById("gameDisplay");

    // nowheresville
    rsw_plaintext_password = "";
}

// remove called when the widget has been removed from the Dashboard
function remove() {
    // remove all preferences (dashboard auto-deletes the file)
    widget.setPreferenceForKey(null, "rswID");
    widget.setPreferenceForKey(null, "rswPassword");
    widget.setPreferenceForKey(null, "rswGameName");
}

function show() {
    retrievePrefs();
    updateOutstanding();
}

// onClick event from the info button on front panel
function showBack(event) {
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display = "none";
    back.style.display = "block";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}


// onClick event from the Done button on back panel
function showFront(event) {
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToFront");
        stowPrefs();
        updateOutstanding();
    }

    front.style.display="block";
    back.style.display="none";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = function(){ };
    widget.onshow = show;
    widget.onsync = function(){ };
}
