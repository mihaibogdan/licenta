var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');
var _ = require('lodash');

var templates_service = require('./templates_service');
var communication_service = require('./communication_service');
var auth_service = require('./auth_service');
var firebase = require('../lib/firebase');


request = request.defaults({jar: true});

var hiddenInputs = [
    '__VIEWSTATE',
    '__VIEWSTATEGENERATOR',
    '__EVENTVALIDATION'
];

var payload = {
    '__WPPS': 's',
    '__LASTFOCUS': '',
    'ctl00_mainCopy_ScriptManager1_HiddenField': '',
    '__EVENTTARGET': '',
    '__EVENTARGUMENT': '',
    'ctl00_subnavTreeview_ExpandState': '',
    'ctl00_subnavTreeview_SelectedNode': '',
    'ctl00_subnavTreeview_PopulateLog': '',
    '__VIEWSTATE': '',
    '__VIEWSTATEGENERATOR': '',
    '__EVENTVALIDATION': '',
    'ctl00$mainCopy$Login1$UserName': '',
    'ctl00$mainCopy$Login1$Password': '',
    'ctl00$mainCopy$Login1$LoginButton': 'Conectare'
};


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
        auth_service.keepConnectionAlive(userID)
            .then(function() {
                scrapeNotes(userID);
            })
            .catch(function(err) {
                console.log('keepConnectionAlive', err);
            });
    }

    function scrapeNotes(userID) {
        var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
        request(url, function(err, resp, body) {
            if (err)
                throw err;
            $ = cheerio.load(body);

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