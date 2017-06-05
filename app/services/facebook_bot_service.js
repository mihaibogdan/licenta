var request = require('request');
var cheerio = require('cheerio');

var templates_service = require('./templates_service');
var communication_service = require('./communication_service');
var auth_service = require('./auth_service');
var firebase = require('../lib/firebase');

request = request.defaults({jar: true});

module.exports = function() {
    function receivedMessage(event) {
        var senderID = event.sender.id;

        var message = event.message;

        var messageText = message.text;
        var messageAttachments = message.attachments;

        if (messageText) {

            switch (messageText) {
                case 'login':
                    communication_service.sendLoginButton(senderID);
                    break;
                case 'logout':
                    communication_service.sendLogoutButton(senderID);
                    break;
                case 'note':
                    startScrappingNotes(senderID);
                    break;
                default:
                    communication_service.sendTextMessage(senderID, messageText);
            }
        } else if (messageAttachments) {
            communication_service.sendTextMessage(senderID, "Message with attachment received");
        }
    }

    function startScrappingNotes(userID) {
        auth_service.keepConnectionAlive(userID, request)
            .then(function() {
                scrapeNotes(userID);
            })
            .catch(function(err) {
                console.log('keepConnectionAlive', err);
            });
    }

    function scrapeNotes(userID) {
        var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
        var options = {
            method: 'post',
            form: {
                '__EVENTARGUMENT': 'Select$2'
            },
            url: url
        };
        request(options, function(err, resp, body) {
            if (err)
                throw err;
            var $ = cheerio.load(body);


            var discipline = $('#ctl00_WebPartManagerPanel1_WebPartManager1_wp523396956_wp729632565_GridViewNote tr');


            for(var i = 0; i < discipline.length; i++) {
                if (i > 0) {
                    communication_service.sendTextMessage(userID, discipline[i].children[4].children[0].children[0].data + ' ' + discipline[i].children[5].children[0].children[0].data);
                }
            }

        });
    }



    return {
        handleMessage: receivedMessage
    };

}