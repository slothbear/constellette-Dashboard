/* 
 This file was generated by Dashcode and is covered by the 
 license.txt included in the project.  You may edit this file, 
 however it is recommended to first turn off the Dashcode 
 code generator otherwise the changes will be lost.
 */
var dashcodePartSpecs = {
    "button": { "creationFunction": "CreateButton", "leftImageWidth": 5, "onclick": "clickDebug", "rightImageWidth": 5, "text": "debug" },
    "done": { "creationFunction": "CreateGlassButton", "onclick": "showFront", "text": "Done" },
    "feedback": { "creationFunction": "CreateGlassButton", "onclick": "clickFeedback", "text": "Feedback" },
    "gameDisplay": { "view": "DC.Text" },
    "gameLabel": { "text": "game", "view": "DC.Text" },
    "idField": { "view": "DC.TextField" },
    "info": { "backgroundStyle": "black", "creationFunction": "CreateInfoButton", "foregroundStyle": "white", "frontID": "front", "onclick": "showBack" },
    "labelGame": { "text": "game", "view": "DC.Text" },
    "labelID": { "text": "RSW id", "view": "DC.Text" },
    "labelPassword": { "text": "password", "view": "DC.Text" },
    "labelPassword1": { "text": "hidden after entry", "view": "DC.Text" },
    "statusIndicator": { "criticalValue": 15, "onValue": 1, "view": "DC.Indicator", "warningValue": 10 },
    "statusMessage": { "view": "DC.Text" },
    "turnLabel1": { "text": "waiting for", "view": "DC.Text" },
    "turnLabel2": { "text": "players", "view": "DC.Text" },
    "turnsDisplay": { "view": "DC.Text" }
};




