'use strict';
var AWS = require("aws-sdk");

var storage = (function() {
  var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  /*
   * The Scrum class stores all scrum data for the user
   */
  function Scrum(session, data) {
    if (data) {
      this.data = data;
    } else {
      this.data = {
        startTime: null,
        endTime: null
      };
    }
    this._session = session;
  }

  Scrum.prototype = {
    save: function(callback) {
      this._session.attributes.currentScrum = this.data;
      dynamodb.putItem({
        TableName: 'ScrumData',
        Item: {
          userId: {
            S: this._session.user.userId
          },
          Data: {
            S: JSON.stringify(this.data)
          }
        }
      }, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        }
        if (callback) {
          callback();
        }
      });
    },

    diffMinsText: function() {
      var tempStartTime = this.data.startTime ? this.data.startTime : Date.now();
      var tempEndTime = this.data.endTime ? this.data.endTime : Date.now();
      var diffMins = Math.round((((tempEndTime - tempStartTime) % 86400000) % 3600000) / 60000);

      return diffMins < 1 ? "less than one minute" : diffMins < 2 ? "1 minute" : diffMins + " minutes";
    }
  };

  return {
    loadScrum: function(session, callback) {
      if (session.attributes.currentScrum) {
        console.log('get scrum from session=' + session.attributes.currentScrum);
        callback(new Scrum(session, session.attributes.currentScrum));
        return;
      }
      dynamodb.getItem({
        TableName: 'ScrumData',
        Key: {
          userId: {
            S: session.user.userId
          }
        }
      }, function(err, data) {
        var currentScrum;
        if (err) {
          console.log(err, err.stack);
          currentScrum = new Scrum(session);
          session.attributes.currentScrum = currentScrum.data;
          callback(currentScrum);
        } else if (data.Item === undefined) {
          currentScrum = new Scrum(session);
          session.attributes.currentScrum = currentScrum.data;
          callback(currentScrum);
        } else {
          console.log('get scrum from dynamodb=' + data.Item.Data.S);
          currentScrum = new Scrum(session, JSON.parse(data.Item.Data.S));
          session.attributes.currentScrum = currentScrum.data;
          callback(currentScrum);
        }
      });
    },
    newScrum: function(session) {
      return new Scrum(session);
    },
  };
})();
module.exports = storage;
