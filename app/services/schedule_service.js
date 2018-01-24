var Promise = require('promise');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var htmlToText = require('html-to-text');

var request = require('request');

var _ = require('lodash');
var moment = require('moment');

var firebase = require('../lib/firebase');
var communication_service = require('./communication_service');

var days = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri'];

var nextDay = {
    'Mon': 'Marti',
    'Tue': 'Miercuri',
    'Wed': 'Joi',
    'Thu': 'Vineri',
    'Fri': 'Luni'
};

var daysRO = {
    'Mon': 'Luni',
    'Tue': 'Marti',
    'Wed': 'Miercuri',
    'Thu': 'Joi',
    'Fri': 'Vineri'
};

var translate = {
  'Luni': 'Mon',
  'Marti': 'Tue',
  'Miercuri': 'Wed',
  'Joi': 'Thu',
  'Vineri': 'Fri'
};

function isADay(text) {
    for (var j = 0; j < days.length; j++) {
        if (text.indexOf(days[j]) !== -1) {
            return days[j];
        }
    }

    return false;
}

module.exports = {
    getSchedule: function(userID) {
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

                    var result = {
                      'Luni': [],
                      'Marti': [],
                      'Miercuri': [],
                      'Joi': [],
                      'Vineri': []
                    };
                    var active = '';

                    for (var i = 1; i < data[0].length; i++ ) {
                        if (isADay(data[0][i])) {
                            active = isADay(data[0][i]);
                        } else {
                            if (active) {
                                result[active].push({
                                    start: data[0][i],
                                    end: data[1][i],
                                    discipline: data[2][i],
                                    type: htmlToText.fromString(data[3][i]),
                                    room: htmlToText.fromString(data[5][i])
                                })
                            }
                        }
                    }
                    resolve(result);
                })
            });
        });
    },
    getTodayScheduleForCurrentUser: function(userID) {
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
                        if (data[0][i].indexOf(daysRO[moment().format('ddd')]) !== -1) {
                            start = i;
                        } else {
                            if (data[0][i].indexOf(nextDay[moment().format('ddd')]) !== -1) {
                                end = i;
                            }
                        }
                    }

                    if (!end) {
                        end = data[0].length;
                    }

                    var schedule = [];

                    for (i = start + 1; i < end; i++) {
                        schedule.push({
                            start: data[0][i],
                            end: data[1][i],
                            discipline: data[2][i],
                            type: htmlToText.fromString(data[3][i]),
                            room: htmlToText.fromString(data[5][i])
                        });
                    }

                    var result = {
                        day: daysRO[moment().format('ddd')],
                        schedule: schedule
                    };
                    resolve(result);
                })
            });
        });
    },
    getTomorrowScheduleForCurrentUser: function(userID) {
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
                            if (data[0][i].indexOf(nextDay[translate[nextDay[moment().format('ddd')]]]) !== -1) {
                                end = i;
                            }
                        }
                    }

                    if (!end) {
                        end = data[0].length;
                    }

                    var schedule = [];

                    for (i = start + 1; i < end; i++) {
                        schedule.push({
                            start: data[0][i],
                            end: data[1][i],
                            discipline: data[2][i],
                            type: htmlToText.fromString(data[3][i]),
                            room: htmlToText.fromString(data[5][i])
                        });
                    }

                    var result = {
                        day: daysRO[moment().format('ddd')],
                        schedule: schedule
                    };
                    resolve(result);
                })
            });
        });
    }
};
