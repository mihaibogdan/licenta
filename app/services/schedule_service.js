var Promise = require('promise');
var cheerio = require('cheerio');
var request = require('request');

var _ = require('lodash');

var firebase = require('../lib/firebase');
var communication_service = require('./communication_service');

module.exports = {
    getScheduleForCurrentUser: function(userId) {
        firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
            console.log(snapshot.val());
        });

    }
};
