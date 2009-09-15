var cs_debug = true;

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = function(){ };
}


// called by <body> element onload event when the widget is ready to start
function load() {
    alert("load()");
    dashcode.setupParts();
}

// remove called when the widget has been removed from the Dashboard
function remove() {
    alert("remove()");
    // remove all preferences (dashboard auto-deletes the file)
    widget.setPreferenceForKey(null, "rswID");
    widget.setPreferenceForKey(null, "rswPassword");
    widget.setPreferenceForKey(null, "rswGameName");
}

function hide() {
    alert("hide()");
}

function show() {
    alert("show()");
    retrievePrefs();
    updateOutstanding();
}

// onClick event from the info button on front panel
function showBack(event) {
    alert("showBack()");
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display = "none";
    back.style.display = "block";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
        retrievePrefs();
    }
}


// onClick event from the Done button on back panel
function showFront(event) {
    alert("showFront()");
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


function stowPrefs() {
    widget.setPreferenceForKey(idField.value, "rswID");

    // Password is displayed as ••••••••, don't overwrite
    var pwValue = passwordField.value;
    if (pwValue && pwValue.length > 0 && pwValue != "••••••••") {
        widget.setPreferenceForKey(pwValue, "rswPassword");
        passwordField.value = "••••••••";  // clear so secret not revealed in future.
    }
    
    setGameName(gameField.value);
}

function setGameName(gameName) {
    if (!gameName || 0 == gameName.length) {
        return;
    }
    widget.setPreferenceForKey(gameName, "rswGameName");
    document.getElementById("gameDisplay").innerText = gameName;
}


function retrievePrefs() {
    var idPref = widget.preferenceForKey("rswID"); 
    if (idPref && idPref.length > 0) {
        idField.value = idPref;
    }

    var gamePref = widget.preferenceForKey("rswGameName"); 
    if (gamePref && gamePref.length > 0) {
        gameField.value = gamePref;
        document.getElementById("gameDisplay").innerText = gamePref;
    }
    
    // if set, display password as some dots
    var pwPref = widget.preferenceForKey("rswPassword"); 
    if (pwPref && pwPref.length > 0) {
        passwordField.value = "••••••••";
    }    
}

function updateOutstanding() {
    var postDataString = postData();
    if ("" == postDataString) {
        statusMessage.innerText =
        "Please fill in id, password, and game on the back.";
        return;
    }

    statusMessage.innerText = "... updating ...";
    statusIndicator.object.setValue(10);
    retrieveGameStatus(postDataString);
}

function retrieveGameStatus(postDataString) {
    alert("retrieveGameStatus() " + cs_debug);
    if (!cs_debug) {
        alert("get real server response");
        $.ajax({
            type: "POST",
            url: "https://rswgame.com/xml",
            cache: false,
            processData: false,
            data: postDataString,
            success: function(data){ processGames(data); },
            contentType: "text/xml",
            dataType: "xml"
        });
    }
    else {  // get mock response
        alert("process mock response");
        processGames("<?xml version='1.0' encoding='utf-8'?><response><gameHeader gameId='northern6i' numWaitingFor='6' state='active'/></response>");
    }

}

function postData() {
    var idPref = widget.preferenceForKey("rswID");
    var gamePref = widget.preferenceForKey("rswGameName");
    var passPref = widget.preferenceForKey("rswPassword");
    
    if (idPref && idPref.length > 0 &&
        gamePref && gamePref.length > 0 &&
        passPref && passPref.length > 0) {
        return "<?xml version='1.0'?>" +
            "<request command='list'>" + 
            "<parameter keyword='accountId' value='" +
            idPref + "' />" + 
            "<parameter keyword='password' value='" + 
            passPref + "' />" + 
            "<parameter keyword='onlyMine' value='true' />" +
            "<parameter keyword='format' value='xml' />" +
            "<parameter keyword='active' value='true' />" +
            "</request>";
    }
    else {
        return "";
    }
}

function processGames(game_xml) {
    // presume things will succeed
    statusMessage.innerText = "";
    statusIndicator.object.setValue(1);  
    
    var rgame = widget.preferenceForKey("rswGameName");
    var result = "";
    
    $(game_xml).find("gameHeader").each(function() {
        var header = $(this);
        if (header.attr("gameId") == rgame) {
            result = header.attr("numWaitingFor");
        }
    });
        
    if (result == "") {
        statusIndicator.object.setValue(15);
        statusMessage.innerText = "game not found or inactive";
    }
    else {
        turnsDisplay.innerText = result;
    }
}

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
