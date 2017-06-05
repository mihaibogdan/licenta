var request = require('request');
var PAGE_ACCESS_TOKEN = 'EAAGHOUlg6hYBACbz4EgqOvhP9i17OyHfeZCc2pOyZCqFtSGsOnH54EVH23rW4WErIzXibpyHdrWhCclFivmfZAsXZCQwsdbL5xg1hvk1SQG0zUuK3FFYEbVhBbZBqhEjDgTPStSZBc8iGbhIi9Sh2mBnjjxDM5euhfgxbx1V2LMQZDZD';


module.exports = {
    sendTextMessage: function(recipientId, messageText) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText
            }
        };

        module.exports.callSendAPI(messageData);
    },
    callSendAPI: function(messageData) {
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
            } else {
                console.error("Unable to send message.");
                console.error(response);
                console.error(error);
            }
        });
    }
};