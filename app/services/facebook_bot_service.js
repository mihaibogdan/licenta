var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var templates_service = require('./templates_service');
var communication_service = require('./communication_service');
var auth_service = require('./auth_service');
var firebase = require('../lib/firebase');

request = request.defaults({jar: true});

var payloadsGrades = {
    '__WPPS': 'u',
    '__EVENTTARGET': 'ctl00$WebPartManagerPanel1$WebPartManager1$wp1153997053$wp964809087$gridStudenti',
    '__EVENTARGUMENT': 'Select$0',
    '__VIEWSTATE': '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',
    '__VIEWSTATEGENERATOR': '9D1941F8',
    '__VIEWSTATEENCRYPTED': '',
    '__EVENTVALIDATION': 'FF66razzv6taiNB2ld4UoR2NF46PsB/hccJSAdcAOTkpm4b0pYu/T6S/585A9+/1IsnAb4j/fKJaBcgm5f8PJLfwqVZF3aL0dLZ/YudGRCaJMFajBRxN2E8VvrFKjvR0+xdgszgtDuTAe7xwoTR6zpR+XGbkopPx5uDOm+pC6q4pjQEgrTzJJVOCKdgLVoRzI3sCG+RWGyLd6c5RiTNQBDpGVFbeNAvJAD9WzvzlggizBeWtZztS9+QmPbpPTQ+v+CJXkKnpjwv7Zp/Mcg9xOkbX/37U4THksreqmnDnN/b00w/p7JaKDa3MrlD9F7fvMWwb8bR8QgoapRJ8WTNAxtNaDaG3OJsAElgmMWQQ438R/bVOEEiDj6lFrFR4SUUOBysa1TIYTkn/d/f0FbxiB8lpSHWEzevuH/P6YzWSfdFHat6w5ZBoOOrv520Li7RRG49v3Alh5SAsWUut/c3pq1nBsvda1zTOpObq76i/xa2KgoZpB/851LmP14Eu099BebcYm5DwknvfOsXFf3ojnsGX2AvLEHx8YJ9bGuEpxyd3aBhrmlB6SK3YxCbWFEgRdZWTHGEQazHRvEwPtr5imrgXqirC/8kr3axt0XZSE7ZJDTrcEGyOUEnyk0FaRrHgqv1uX+qAfqy1NyQwnThvONUF2Vdt6hzQNJeIDiK1iBtJCAAM73D/NuTWJrLEsIIO2tfRrA==',
};

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

        // send default message
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

            getMarks(semester).then(function(marks) {
                for (var i = 0; i < marks.length; i++) {
                    if (parseInt(marks[i].value) < 5 ) {
                        restante++;
                        communication_service.sendTextMessage(senderID, marks[i].name + ' ' + marks[i].value);
                    }
                }

                semesterCallback(null);
            })


        }, function done() {
            if (!restante) {
                communication_service.sendTextMessage(senderID, 'Nu ai nicio restanta!');
            }
        });
    }

    function scrapeMarks(senderID, year, semesters) {
        async.eachSeries(semesters, function semesterIteree(semester, semesterCallback) {

            communication_service.sendTextMessage(senderID, '-------An ' + year + ', semestrul ' + ((semester % 2) + 1) + '-------');

            getMarks(semester).then(function(marks) {
                async.eachSeries(marks, function markIteree(mark, markCallback) {
                    communication_service.sendTextMessage(senderID, mark.name + ' ' + mark.value).then((function() {
                        markCallback(null);
                    }));
                }, function done() {
                    semesterCallback(null);
                });

            })
        }, function done() {
            //...
        });

    }

    function getMarks(semester) {
        var marks = [];
        var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
        var options = {
            method: 'post',
            form: payloadsGrades,
            url: url
        };
        payloadsGrades.__EVENTARGUMENT = 'Select$' + semester;

        return new Promise(function(resolve, reject) {
            request(options, function(err, resp, body) {
                if (err)
                    throw err;
                var $ = cheerio.load(body);


                var discipline = $('#ctl00_WebPartManagerPanel1_WebPartManager1_wp523396956_wp729632565_GridViewNote tr');


                for(var i = 0; i < discipline.length; i++) {
                    if (i > 0) {
                        marks.push({ name: discipline[i].children[4].children[0].children[0].data, value: discipline[i].children[5].children[0].children[0].data})
                    }
                }

                resolve(marks);
            });
        })
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
        matchMessage: matchMessage
    };

}