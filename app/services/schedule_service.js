var Promise = require('promise');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');

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
                    var table = $('p:first-of-type').html();
                    cheerioTableparser($);
                    var data = $(table).parsetable(false, false, true);
                    var start, end;

                    for (var i = 1; i < data[0].length; i++ ) {
                        if (data[0][i].indexOf(nextDay[moment().format('ddd')]) !== -1) {
                            start = i;
                        } else {
                            if (started) {
                                if (data[0][i].indexOf(nextDay[nextDay[moment().format('ddd')]]) !== -1) {
                                    end = i;
                                    return;
                                }
                            }
                        }
                    }

                    console.log(start, end);
                    resolve();
                })
            });
        });
    }
};
