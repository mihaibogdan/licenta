var request = require('request');
var PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
var Promise = require('promise');

var templates_service = require('./templates_service');

module.exports = {
    startTyping: function(recipientId) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            "sender_action":"typing_on"
        };
        request({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: PAGE_ACCESS_TOKEN },
                method: 'POST',
                json: messageData

            }, function (error, response, body) {})
    },
    finishTyping: function(recipientId) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            "sender_action":"typing_off"
        };
        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: messageData

        }, function (error, response, body) {})
    },
    sendTextMessage: function(recipientId, messageText) {
        return new Promise(function(resolve, reject) {
            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    text: messageText
                }
            };

            module.exports.callSendAPI(messageData).then(function() {
                resolve();
            });
        })
    },
    callSendAPI: function(messageData) {
        return new Promise(function(resolve, reject) {
            request({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: PAGE_ACCESS_TOKEN },
                method: 'POST',
                json: messageData

            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var recipientId = body.recipient_id;
                    var messageId = body.message_id;

                    console.log("Successfully sent generic message with id %s to recipient %s",
                        messageId, recipientId);
                    resolve();
                } else {
                    console.error("Unable to send message.");
                    console.error(response);
                    console.error(error);
                    reject(error);
                }
            });
        })
    },
    sendLoginButton: function(userID) {
        var messageData = templates_service.loginButton(userID);
        module.exports.callSendAPI(messageData);
    },

    sendLogoutButton: function(userID) {
        var messageData = templates_service.logoutButton(userID);
        module.exports.callSendAPI(messageData);
    },

    sendYearOptions: function(userID) {
        var messageData = templates_service.yearQuickReplies(userID);
        module.exports.callSendAPI(messageData);
    },

    sendBatchOptions: function(userID) {
        var messageData = templates_service.batchQuickReplies(userID);
        module.exports.callSendAPI(messageData);
    },

    sendGroupOptions: function(userID) {
        var messageData = templates_service.groupQuickReplies(userID);
        module.exports.callSendAPI(messageData);
    }
};