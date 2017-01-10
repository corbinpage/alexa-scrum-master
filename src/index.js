/**
 * App ID for the skill
 */
var APP_ID = 'amzn1.ask.skill.da37cf73-e5c1-4cc5-88b5-90d8198287dd';

var cardTitle = 'Scrum Master';

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

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

/**
 * Overriden to show that a subclass can override this function to initialize session state.
 */
ScrumMaster.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);

  // Any session init logic would go here.
};

/**
 * If the user launches without specifying an intent, route to the correct function.
 */
ScrumMaster.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
  console.log("ScrumMaster onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

  handleStartScrumIntent(session, response);
};

/**
 * Overriden to show that a subclass can override this function to teardown session state.
 */
ScrumMaster.prototype.eventHandlers.onSessionEnded = function(sessionEndedRequest, session) {
  console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);

  //Any session cleanup logic would go here.
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

  "AMAZON.HelpIntent": function(intent, session, response) {
    var speechText = "You can ask Scrum Master to start the scrum or end the scrum.";

    var speechOutput = {
      speech: speechText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    var repromptOutput = {
      speech: speechText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    // For the repromptText, play the speechOutput again
    response.ask(speechOutput, repromptOutput);
  },

  "AMAZON.StopIntent": function(intent, session, response) {
    var speechOutput = "Ok, see ya!";
    response.tell(speechOutput);
  },

  "AMAZON.CancelIntent": function(intent, session, response) {
    var speechOutput = "Ok, see ya!";
    response.tell(speechOutput);
  }
};

/**
 * Start Scrum Response.

 * ------Other Ideas------

 * Alexa, tell Scrum Master that yesterday I {tasksCompleted}
 * Alexa, tell Scrum Master that today I will {tasksPlanned}
 * Alexa, tell Scrum Master that I have {2} blockers

 * Alexa, ask Scrum Master to log an Action Item for {Corbin}
 * Alexa, ask Scrum Master to record a blocker for {Corbin}

 * End Scrum - took this long
 */
function handleStartScrumIntent(session, response) {
  var speechText = "Ready! please begin your updates.";
  session.attributes.startTime = Date.now();

  var speechOutput = {
    speech: speechText,
    type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };

  response.tellAndWait(speechOutput);
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

  response.tell(speechOutput);
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

// function handleLogActionItemIntent(session, response) {
//   var speechText = "Done! Action Item logged.";

//   var speechOutput = {
//     speech: speechText,
//     type: AlexaSkill.speechOutputType.PLAIN_TEXT
//   };

//   response.tell(speechOutput);
// }

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
  // Create an instance of the WiseGuy Skill.
  var skill = new ScrumMaster();
  skill.execute(event, context);
};
