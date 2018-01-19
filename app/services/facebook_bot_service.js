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
        regExp: /(note( +)an( +)\d( *)(,?)( *)semestru(l?)( +)\d)/g,
        means: 'note_semestru'
    },
    {
        regExp: /(note( +)an( +)\d)/g,
        means: 'note_an'
    },
    {
        regExp: /(restante( +)an( +)\d)/g,
        means: 'restante_an'
    },
    {
        regExp: /(restante)/g,
        means: 'restante'
    },
    {
        regExp: /(taxe)/g,
        means: 'taxe'
    },
    {
        regExp: /(orar)/g,
        means: 'orar'
    },
    {
        regExp: /(login)/g,
        means: 'login'
    },
    {
        regExp: /(logout)/g,
        means: 'logout'
    }
];

var errors = {
    year: 'Anul ar trebui sa fie 1, 2 sau 3',
    semester: 'Anul ar trebui sa fie 1, 2 sau 3 iar semestrul ar trebuie sa fie 1 sau 2'
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
    }

    function handleQuickReply(event) {
        var senderID = event.sender.id;

        var message = event.message;
        var messagePayload = message.quick_reply.payload;

        if (messagePayload.indexOf('semian') !== -1) {
            communication_service.sendGroupOptions(senderID);
            firebase.database.ref('users/' + senderID).set({batch: message.text});
            return;
        }

        if (messagePayload.indexOf('grupa') !== -1) {
            schedule_service.getScheduleForCurrentUser(senderID);
            firebase.database.ref('users/' + senderID).set({group: message.text});
            return;
        }

        if (messagePayload.indexOf('an') !== -1) {
            communication_service.sendBatchOptions(senderID);
            firebase.database.ref('users/' + senderID).set({year: message.text});    

        }
    }

    function handleMessage (message, meaning, params, senderID, messageAttachments) {
        if (meaning) {

            switch (meaning) {
                case 'login':
                    communication_service.sendLoginButton(senderID);
                    break;
                case 'logout':
                    communication_service.sendLogoutButton(senderID);
                    break;
                case 'orar':
                    communication_service.sendYearOptions(senderID);
                    break;
                case 'note_semestru':
                    var year = parseInt(params[0]);
                    var semester = parseInt(params[1]);
                    if (validateYear(year) && validateSemester(semester)) {
                        auth_service.keepConnectionAlive(senderID, request)
                            .then(function() {
                                scrapeMarks(senderID, year, [(year - 1) * 2 + (semester - 1)]);
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
                                scrapeMarks(senderID, year, [(year * 2) - 2, (year * 2) - 1]);
                            })
                    } else {
                        communication_service.sendTextMessage(senderID, errors.year);
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
        async.eachSeries(semesters, function semesterIteree(semester, semesterCallback) {
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

    function scrapeMarks(senderID, year, semesters) {
        async.eachSeries(semesters, function semesterIteree(semester, semesterCallback) {

            communication_service.sendTextMessage(senderID, '-------An ' + year + ', semestrul ' + ((semester % 2) + 1) + '-------');

            marks_service.getPayload().then(function(payload) {
                marks_service.getMarks(semester, payload).then(function(marks) {
                    async.eachSeries(marks, function markIteree(mark, markCallback) {
                        communication_service.sendTextMessage(senderID, mark.name + ' ' + mark.value).then((function() {
                            markCallback(null);
                        }));
                    }, function done() {
                        semesterCallback(null);
                    });

                })
            });

        }, function done() {
            //...
        });

    }

    function verifyTaxes(senderID) {
        var marks = [];
        var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
        var options = {
            method: 'post',
            form: payloadsGrades,
            url: url
        };
        var atLeastOne = false;

        return new Promise(function(resolve, reject) {
            request(options, function(err, resp, body) {
                if (err)
                    throw err;
                var $ = cheerio.load(body);


                var discipline = $('#ctl00_WebPartManagerPanel1_WebPartManager1_wp1896648950_wp1261240874_GridViewTaxe tr');

                for(var i = 0; i < discipline.length; i++) {
                    if (i > 0) {
                        if (!discipline[i].children[1].children[0].children[0].data) {
                            communication_service.sendTextMessage(senderID, discipline[i].children[1].children[0].children[0].data + ' ' + discipline[i].children[2].children[0].children[0].data);
                            atLeastOne = true;
                        }
                    }
                }

                if (!atLeastOne) {
                    communication_service.sendTextMessage(senderID, 'Nu ai de platit nicio taxa!');
                }
                 resolve();
            });
        })
        
    }

    return {
        matchMessage: matchMessage,
        handleQuickReply: handleQuickReply
    };
};