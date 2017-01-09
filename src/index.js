/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
    */

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Session State: Handles a multi-turn dialog model.
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 * - SSML: Using SSML tags to control how Alexa renders the text-to-speech.
 *
 * Examples:
 * Dialog model:
 *  User: "Alexa, ask Wise Guy to tell me a knock knock joke."
 *  Alexa: "Knock knock"
 *  User: "Who's there?"
 *  Alexa: "<phrase>"
 *  User: "<phrase> who"
 *  Alexa: "<Punchline>"
 */

/**
 * App ID for the skill
 */
var APP_ID = 'amzn1.ask.skill.da37cf73-e5c1-4cc5-88b5-90d8198287dd'; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * Array containing knock knock jokes.
 */
var cardTitle = 'Scrum Master';

/**
 * Array containing knock knock jokes.
 */
var JOKE_LIST = [{
    setup: "To",
    speechPunchline: "Correct grammar is <break time=\"0.2s\" /> to whom.",
    cardPunchline: "Correct grammar is 'to whom'."
  },
  { setup: "Beets!", speechPunchline: "Beats me!", cardPunchline: "Beats me!" }, {
    setup: "Little Old Lady",
    speechPunchline: "I didn't know you could yodel!",
    cardPunchline: "I didn't know you could yodel!"
  }, {
    setup: "A broken pencil",
    speechPunchline: "Never mind. It's pointless.",
    cardPunchline: "Never mind. It's pointless."
  },
  { setup: "Snow", speechPunchline: "Snow use. I forgot", cardPunchline: "Snow use. I forgot" }, {
    setup: "Boo",
    speechPunchline: "Aww <break time=\"0.3s\" /> it's okay <break time=\"0.3s\" /> don't cry.",
    cardPunchline: "Aww, it's okay, don't cry."
  }, {
    setup: "Woo",
    speechPunchline: "Don't get so excited, it's just a joke",
    cardPunchline: "Don't get so excited, it's just a joke"
  }, {
    setup: "Spell",
    speechPunchline: "<say-as interpret-as=\"characters\">who</say-as>",
    cardPunchline: "w.h.o"
  },
  { setup: "Atch", speechPunchline: "I didn't know you had a cold!", cardPunchline: "I didn't know you had a cold!" },
  { setup: "Owls", speechPunchline: "Yes, they do.", cardPunchline: "Yes, they do." },
  { setup: "Berry!", speechPunchline: "Berry nice to meet you.", cardPunchline: "Berry nice to meet you." }
];

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * ScrumMaster is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
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

  handleTellMeAJokeIntent(session, response);
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

  "AMAZON.HelpIntent": function(intent, session, response) {
    var speechText = "You can say, start scrum or end scrum.";

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
