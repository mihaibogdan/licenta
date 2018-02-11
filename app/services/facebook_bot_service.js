var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var templates_service = require('./templates_service');
var communication_service = require('./communication_service');
var auth_service = require('./auth_service');
var marks_service = require('./marks_service');
var schedule_service = require('./schedule_service');
var firebase = require('../lib/firebase');

request = request.defaults({jar: true});

var regularExpressions = [
    {
        regExp: /[a-zA-Z0-9 ]*(note[a-zA-Z0-9 ]*(an|anul)[a-zA-Z0-9 ]*\d[a-zA-Z0-9 ,]*semestru(l?)[a-zA-Z0-9 ]\d)/gi,
        means: 'note_semestru'
    },
    {
        regExp: /[a-zA-Z0-9 ]*(note[a-zA-Z0-9 ]*(an|anul)[a-zA-Z0-9 ]*\d)/gi,
        means: 'note_an'
    },
    {
        regExp: /(not(a|ă)( +)*)\w+/gi,
        means: 'nota'
    },
    {
        regExp: /[a-zA-Z0-9 ]*(restante[a-zA-Z0-9 ]*(an|anul)[a-zA-Z0-9 ]*\d)/gi,
        means: 'restante_an'
    },
    {
        regExp: /(restante)/gi,
        means: 'restante'
    },
    {
        regExp: /(taxe)/gi,
        means: 'taxe'
    },
    {
        regExp: /[a-zA-Z0-9 ]*(orar[a-zA-Z0-9 ]*m(a|â)ine)/gi,
        means: 'orar_maine'
    },
    {
        regExp: /[a-zA-Z0-9, ]*(orar[a-zA-Z0-9, ]*(azi|astazi))/gi,
        means: 'orar_azi'
    },
    {
        regExp: /(orar( +)reset)/gi,
        means: 'orar_reset'
    },
    {
        regExp: /(orar)/gi,
        means: 'orar'
    },
    {
        regExp: /(login)/gi,
        means: 'login'
    },
    {
        regExp: /(logout)/g,
        means: 'logout'
    }
];

var errors = {
    year: 'Anul ar trebui sa fie 1, 2 sau 3',
    semester: 'Anul ar trebui sa fie 1, 2 sau 3, iar semestrul ar trebui sa fie 1 sau 2'
};

module.exports = function() {
    function matchMessage(event) {
        var senderID = event.sender.id;

        var message = event.message;

        var messageText = message.text;
        var messageAttachments = message.attachments;

        var lowerCaseMessage = messageText.toLowerCase();
        var match, params;
        for (var i = 0; i < regularExpressions.length; i++) {
            match = lowerCaseMessage.match(regularExpressions[i].regExp);
            if (match) {
                params = lowerCaseMessage.match(/\d/g);
                handleMessage(messageText, regularExpressions[i].means, params, senderID, messageAttachments);
                return ;
            }
        }

        communication_service.sendTextMessage(senderID, 'Mai incercati o data, poate ati gresit o litera.');
    }

    function handleQuickReply(event) {
        var senderID = event.sender.id;

        var message = event.message;
        var messagePayload = message.quick_reply.payload;

        if (messagePayload.indexOf('semian') !== -1) {
            communication_service.sendGroupOptions(senderID);
            firebase.database.ref('users/' + senderID).update({batch: message.text});
            return;
        }

        if (messagePayload.indexOf('grupa') !== -1) {
            schedule_service.getTodayScheduleForCurrentUser(senderID);
            firebase.database.ref('users/' + senderID).update({group: message.text});
            return;
        }

        if (messagePayload.indexOf('an') !== -1) {
            communication_service.sendBatchOptions(senderID);
            firebase.database.ref('users/' + senderID).update({year: message.text});

        }
    }

    function handleMessage (message, meaning, params, senderID, messageAttachments) {
        communication_service.startTyping(senderID);
        if (meaning) {
            switch (meaning) {
                case 'login':
                    communication_service.sendLoginButton(senderID);
                    break;
                case 'logout':
                    communication_service.sendLogoutButton(senderID);
                    break;
                case 'orar':
                    auth_service.keepConnectionAlive(senderID, request)
                        .then(function() {
                            auth_service.getUser(senderID).then(function (user) {
                               if (!user.year) {
                                   communication_service.sendYearOptions(senderID);
                               } else {
                                   schedule_service.getSchedule(senderID).then(function (res) {
                                       async.eachSeries(res, function iteree(s, scheduleCallback) {
                                           showDaySchedule(senderID, { day: s.day, schedule: s.schedule}).then(function() {
                                               scheduleCallback();
                                           });
                                       }, function done() {});
                                   });
                               }
                            });

                        });
                    break;
                case 'orar_reset':
                    auth_service.keepConnectionAlive(senderID, request)
                        .then(function() {
                            communication_service.sendYearOptions(senderID);
                        });
                    break;
                case 'orar_maine':
                    schedule_service.getTomorrowScheduleForCurrentUser(senderID).then(function (res) {
                        showDaySchedule(senderID, res);
                    });
                    break;
                case 'orar_azi':
                    schedule_service.getTodayScheduleForCurrentUser(senderID).then(function (res) {
                        showDaySchedule(senderID, res);
                    });
                    break;
                case 'note_semestru':
                    var year = parseInt(params[0]);
                    var semester = parseInt(params[1]);
                    if (validateYear(year) && validateSemester(semester)) {
                        auth_service.keepConnectionAlive(senderID, request)
                            .then(function() {
                                marks_service.scrapeMarks(senderID, year, [(year - 1) * 2 + (semester - 1)]);
                            })
                    } else {
                        communication_service.sendTextMessage(senderID, errors.semester);
                    }
                    break;
                case 'note_an':
                    var year = parseInt(params[0]);
                    if (validateYear(year)) {
                        auth_service.keepConnectionAlive(senderID, request)
                            .then(function() {
                                marks_service.scrapeMarks(senderID, year, [(year * 2) - 2, (year * 2) - 1], request);
                            })
                    } else {
                        communication_service.sendTextMessage(senderID, errors.year);
                    }
                    break;
                case 'nota':
                    var lowerCaseMessage = message.toLowerCase();
                    var p = lowerCaseMessage.split(' ').slice(1).join(' ');
                    if (marks_service.abbreviations[p]) {
                        auth_service.keepConnectionAlive(senderID, request)
                            .then(function() {
                                marks_service.findMarks(senderID, marks_service.abbreviations[p], [0, 1, 2, 3, 4, 5])
                                    .then(function(result) {
                                        if (!result.length) {
                                            communication_service.sendTextMessage(senderID, 'Inca nu este nicio nota la ' + marks_service.abbreviations[p].join(' '));
                                        }
                                    });
                            });

                    } else {
                        communication_service.sendTextMessage(senderID, 'Materia nu exista');
                    }
                    break;
                case 'restante_an':
                    var year = parseInt(params[0]);
                    if (validateYear(year)) {
                        auth_service.keepConnectionAlive(senderID, request)
                            .then(function () {
                                showDebts(senderID, [(year * 2) - 2, (year * 2) - 1]);
                            });
                    } else {
                        communication_service.sendTextMessage(senderID, errors.semester);
                    }
                    break;
                case 'restante':
                    auth_service.keepConnectionAlive(senderID, request)
                        .then(function() {
                            showDebts(senderID, [0, 1, 2, 3, 4, 5]);
                        });
                    break;
                case 'taxe':
                    auth_service.keepConnectionAlive(senderID, request)
                        .then(function() {
                            verifyTaxes(senderID);
                        });
                    break;
                default:
                    communication_service.sendTextMessage(senderID, message);
            }
        } else if (messageAttachments) {
            communication_service.sendTextMessage(senderID, "Message with attachment received");
        }
    }

    function validateYear(year) {
        return year >= 1 && year <= 3;
    }

    function validateSemester(semester) {
        return semester >= 1 && semester <= 2;
    }

    function showDebts(senderID, semesters) {
        var restante = 0;
        async.each(semesters, function semesterIteree(semester, semesterCallback) {
            marks_service.getPayload().then(function(payload) {
                marks_service.getMarks(semester, payload).then(function(marks) {
                    for (var i = 0; i < marks.length; i++) {
                        if (parseInt(marks[i].value) < 5 ) {
                            restante++;
                            communication_service.sendTextMessage(senderID, marks[i].name + ' ' + marks[i].value);
                        }
                    }
                    semesterCallback(null);
                })
            });
        }, function done() {
            if (!restante) {
                communication_service.sendTextMessage(senderID, 'Nu ai nicio restanta!');
            }
        });
    }

    function verifyTaxes(senderID, semesters) {
        var marks = [];
        var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
        var atLeastOne = false;
        return new Promise(function(resolve, reject) {

            async.each(semesters, function semesterIteree(semester, semesterCallback) {
                marks_service.getPayload().then(function (payload) {
                    payload.__EVENTARGUMENT = 'Select$' + semester;
                    var options = {
                        method: 'post',
                        form: payload,
                        url: url
                    };
                    request(options, function (err, resp, body) {
                        if (err)
                            throw err;
                        var $ = cheerio.load(body);


                        var discipline = $('#ctl00_WebPartManagerPanel1_WebPartManager1_wp1896648950_wp1261240874_GridViewTaxe tr');

                        for (var i = 0; i < discipline.length; i++) {
                            if (i > 0) {
                                if (!discipline[i].children[1].children[0].children[0].data) {
                                    communication_service.sendTextMessage(senderID, discipline[i].children[1].children[0].children[0].data + ' ' + discipline[i].children[2].children[0].children[0].data);
                                    atLeastOne = true;
                                }
                            }
                        }
                        semesterCallback();
                    });
                })
            }, function (err) {
                if (!atLeastOne) {
                    communication_service.sendTextMessage(senderID, 'Nu ai nicio taxă restantă.');
                }
                resolve();
            });
        });
    }

    function showDaySchedule(senderID, obj) {
        var string = '';
        return new Promise(function(resolve, reject) {
            communication_service.sendTextMessage(senderID, obj.day).then(function() {
                async.eachSeries(obj.schedule, function iteree(line, scheduleCallback) {
                    string = line.start + ' - ' + line.end + ' ' + line.discipline + ' ' + line.type + ' ' + line.room;

                    communication_service.sendTextMessage(senderID, string).then((function() {
                        scheduleCallback(null);
                    }));
                }, function done() {
                    resolve();
                });
            });
        })
    }

    return {
        matchMessage: matchMessage,
        handleQuickReply: handleQuickReply
    };
};