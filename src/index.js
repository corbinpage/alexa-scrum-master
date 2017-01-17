var AlexaSkill = require('./AlexaSkill');
var storage = require('./storage');

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
    var speechOutput = "Ok, maybe another time!";
    response.tell(speechOutput);
  },

  "AMAZON.HelpIntent": function(intent, session, response) {
    var speechText = "You can use Scrum Master to start a scrum and track how long the meeting takes. Would you like to start a scrum?";
    var repromptText = "Would you like to start a scrum?";

    response.ask(speechText, repromptText);
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
  var speechText = "Hi there, would you like to start a scrum?";
  var repromptText = "Would you like to start a scrum?";

  response.ask(speechText, repromptText);
}

function handleStartScrumIntent(session, response) {
  storage.loadScrum(session, function(currentScrum) {
    currentScrum.data.startTime = Date.now();
    currentScrum.data.endTime = null;

    currentScrum.save(function() {
      var speechOutput = "Scrum started! Please begin your updates.";
      response.tell(speechOutput);
    });
  });
}

function handleTellScrumTimeIntent(session, response) {
  storage.loadScrum(session, function(currentScrum) {
    var speechText = "";
    var diffMinsText = currentScrum.diffMinsText()

    if (currentScrum.data.startTime && currentScrum.data.endTime) {
      speechText = "You don't have an active scrum right now, but your last scrum meeting took " + diffMinsText + ".";
    } else if (currentScrum.data.startTime) {
      speechText = "Your scrum has been going for " + diffMinsText + " so far.";
    } else {
      speechText = "You don't currently have any scrum meetings logged.";
    }

    var speechOutput = {
      speech: speechText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };

    response.tell(speechOutput);
  });
}

function handleEndScrumIntent(session, response) {
  storage.loadScrum(session, function(currentScrum) {
    currentScrum.data.endTime = Date.now();
    var speechText = "";

    if (currentScrum.data.startTime) {
      var diffMs = (currentScrum.data.endTime - currentScrum.data.startTime);
      var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
      var diffMinsText = diffMins < 1 ? "less than one minute" : diffMins < 2 ? "1 minute" : diffMins + " minutes";

      speechText = "Good job! Your scrum took " + diffMinsText + " today.";
    } else {
      speechText = "Good job!";
    }

    currentScrum.save(function() {
      var speechOutput = {
        speech: speechText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
      };

      response.tell(speechOutput);
    });
  });
}

function handleExit(session, response) {
  var speechOutput = "Ok, see ya later!";
  response.tell(speechOutput);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
  // Create an instance of the ScrumMaster Skill.
  var skill = new ScrumMaster();
  skill.execute(event, context);
};
