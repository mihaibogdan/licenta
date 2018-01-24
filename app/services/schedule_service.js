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
                    var table = $('table:first-of-type').text();
                    cheerioTableparser($);
                    console.log(table);
                    // var data = $(table).parsetable();
                    // console.log(data);
                    var started = false;

                    // for (var i = 1; i < rows.length; i++ ) {
                    //     console.log(rows[i].children[0].data);
                    //     // if (rows[i].children[0].data.indexOf(nextDay[moment().format('ddd')]) !== -1) {
                    //     //     started = true;
                    //     // } else {
                    //     //     if (started) {
                    //     //         if (rows[i].children[0].children[0].children[0].data.indexOf(nextDay[nextDay[moment().format('ddd')]]) !== -1) {
                    //     //             return;
                    //     //         }
                    //     //         console.log(rows[i].children[0].children[0].children[0].data);
                    //     //     }
                    //     // }
                    // }
                    resolve();
                })
            });
        });
    }
};
