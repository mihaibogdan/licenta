var Promise = require('promise');
var cheerio = require('cheerio');
var request = require('request');

var _ = require('lodash');
var moment = require('moment');

var firebase = require('../lib/firebase');
var communication_service = require('./communication_service');

var nextDay = {
    'Mon': 'Marti',
    'Tue': 'Miercuri',
    'Wed': 'Joi',
    'Thu': 'Vineri',
    'Fri': 'Luni'
};

var days = {
    'Mon': 'Luni',
    'Tue': 'Marti',
    'Wed': 'Miercuri',
    'Thu': 'Joi',
    'Fri': 'Vineri'
};

module.exports = {
    getScheduleForCurrentUser: function(userID) {
        return new Promise(function(resolve, reject) {
            firebase.database.ref('users/' + userID).once('value', function(snapshot) {
                var user = snapshot.val();

                var url = 'https://profs.info.uaic.ro/~orar/participanti/orar_I' + user.year + user.batch + user.group + '.html';
                request(url, function(err, resp, body) {
                    if (err)
                        throw err;
                    $ = cheerio.load(body);
                    console.log(body);

                    resolve();
                })
            });
        });
    }
};
