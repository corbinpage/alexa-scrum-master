var AlexaSkill = require('./AlexaSkill');
// var storage = require('./storage');
// var textHelper = require('./textHelper');

var APP_ID = 'amzn1.ask.skill.da37cf73-e5c1-4cc5-88b5-90d8198287dd';
var cardTitle = 'Scrum Master';


/**
 * ScrumMaster is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 */
var ScrumMaster = function() {
  AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
ScrumMaster.prototype = Object.create(AlexaSkill.prototype);
ScrumMaster.prototype.constructor = ScrumMaster;


ScrumMaster.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);

  // Any session init logic would go here.
};

/**
 * If the user launches without specifying an intent, route to the correct function.
 */
ScrumMaster.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
  console.log("ScrumMaster onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

  handleOnLaunch(session, response);
};

ScrumMaster.prototype.eventHandlers.onSessionEnded = function(sessionEndedRequest, session) {
  console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);

  handleEndScrumIntent(session, response);
};

ScrumMaster.prototype.intentHandlers = {

  "StartScrumIntent": function(intent, session, response) {
    handleStartScrumIntent(session, response);
  },

  "EndScrumIntent": function(intent, session, response) {
    handleEndScrumIntent(session, response);
  },

  "TellScrumTimeIntent": function(intent, session, response) {
    handleTellScrumTimeIntent(session, response);
  },

  "YesIntent": function(intent, session, response) {
    handleStartScrumIntent(session, response);
  },

  "NoIntent": function(intent, session, response) {
    handleExit(session, response);
  },

  "AMAZON.HelpIntent": function(intent, session, response) {
    var speechOutput = "You can ask Scrum Master to start the scrum, end the scrum, or how long the scrum has been going.";
    response.tell(speechOutput);
  },

  "AMAZON.StopIntent": function(intent, session, response) {
    handleExit(session, response);
  },

  "AMAZON.CancelIntent": function(intent, session, response) {
    handleExit(session, response);
  }
};

/**
 * Launch
 * Start Scrum Response.

 * ------Other Ideas------

 * Alexa, tell Scrum Master that yesterday I {tasksCompleted}
 * Alexa, tell Scrum Master that today I will {tasksPlanned}
 * Alexa, tell Scrum Master that I have {2} blockers

 * Alexa, ask Scrum Master to log an Action Item for {Corbin}
 * Alexa, ask Scrum Master to record a blocker for {Corbin}

 * End Scrum - took this long
 */

function handleOnLaunch(session, response) {
  var speechText = "Thanks for stopping by, would you like to start a scrum?";
  var repromptText = "Would you like to start a scrum?";

  response.ask(speechText, repromptText);
}

function handleStartScrumIntent(session, response) {
  var speechText = "Ready! please begin your updates.";
  session.attributes.startTime = Date.now();

  var speechOutput = {
    speech: speechText,
    type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };

  response.tell(speechOutput);
}

function handleTellScrumTimeIntent(session, response) {
  var speechText = "";

  if (session.attributes.startTime) {
    var diffMs = (Date.now() - session.attributes.startTime);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    var diffMinsText = diffMins < 1 ? "less than one minute" : diffMins < 2 ? "1 minute" : diffMins + " minutes";

    speechText = "Your scrum has been going for " + diffMinsText + " so far.";
  } else {
    speechText = "You don't currently have an active Scrum.";
  }

  var speechOutput = {
    speech: speechText,
    type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };

  response.tellAndWait(speechOutput);
}

function handleEndScrumIntent(session, response) {
  var speechText = "";
  session.attributes.endTime = Date.now();

  if (session.attributes.startTime) {

    var diffMs = (session.attributes.endTime - session.attributes.startTime);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    var diffMinsText = diffMins < 1 ? "less than one minute" : diffMins < 2 ? "1 minute" : diffMins + " minutes";

    speechText = "Good job! Your scrum took " + diffMinsText + " today.";
  } else {
    speechText = "Good job!";
  }

  var speechOutput = {
    speech: speechText,
    type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };

  response.tell(speechOutput);
}

function handleExit(session, response) {
  var speechOutput = "Ok, see ya!";
  response.tell(speechOutput);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
  // Create an instance of the ScrumMaster Skill.
  var skill = new ScrumMaster();
  skill.execute(event, context);
};
