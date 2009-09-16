var INDICATOR_OFF = 0;
var INDICATOR_GREEN = 1;
var INDICATOR_YELLOW = 2;
var INDICATOR_RED = 3;

var PASSWORD_MASK = "••••••••••";

// back panel fields
var rsw_id;
var rsw_game;

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

    retrieveGameStatus(postData());
}

function retrieveGameStatus(postDataString) {
    $.ajax({
        type: "POST",
        url: "https://rswgame.com/xml",
        cache: false,
        processData: false,
        data: postDataString,
        success: function(data){ processGames(data); },
error: function (xhr, status, errt) { setErrorStatus(status); },
        timeout: 10000,
        contentType: "text/xml",
        dataType: "xml"
    });

//    <mock> processGames("<?xml version='1.0' encoding='utf-8'?><response><gameHeader gameId='northern6i' numWaitingFor='6' state='active'/></response>");
}

function postData() {
    return "<?xml version='1.0'?>" +
        "<request command='list'>" +
        "<parameter keyword='accountId' value='" +
        rsw_id.value + "' />" +
        "<parameter keyword='password' value='" +
        rsw_plaintext_password + "' />" +
        "<parameter keyword='onlyMine' value='true' />" +
        "<parameter keyword='format' value='xml' />" +
        "<parameter keyword='active' value='true' />" +
        "</request>";
}

function processGames(game_xml) {
    // Presume the operation will succeed.
    setStatus("");
    statusIndicator.object.setValue(INDICATOR_GREEN);  
    
    var rgame = rsw_game.value;
    var result = "";
    
    $(game_xml).find("gameHeader").each(function() {
        var header = $(this);
        if (header.attr("gameId") == rgame) {
            result = header.attr("numWaitingFor");
        }
    });
        
    if (result == "") {
        setErrorStatus("game not found or inactive");
    }
    else {
        turnsDisplay.innerText = result;
    }
}

function setStatus(msg) {
    statusMessage.innerText = msg;
}

function setErrorStatus(msg) {
    setStatus(msg + " (use Debug on back if needed)");
    statusIndicator.object.setValue(INDICATOR_RED);
}

//
// buttons and things that take us outside
//

function clickDebug(event) {
    showFront();
    widget.openURL("mailto:bugs@constella.org?subject=xml log&body=something went really really wrong.");
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
