module.exports = {
    loginButton: function(userID) {

        var message = {
            "recipient": {
                "id": userID
            },
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": "Login",
                        "buttons": [
                            {
                                "type": "account_link",
                                "url": "https://pure-waters-25616.herokuapp.com/static/index.html"
                            }
                        ]
                    }
                }
            }
        };

        return message;
    },

    logoutButton: function(userID) {
        var message = {
            "recipient": {
                "id": userID
            },
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": "Logout",
                        "buttons": [
                            {
                                "type": "account_unlink"
                            }
                        ]
                    }
                }
            }
        };
        return message;
    },

    yearQuickReplies: function(userID) {
        var message = {
            "recipient": {
                "id": userID
            },
            "message": {
                "text": "In ce an esti?",
                "quick_replies":[
                    {
                        "content_type":"text",
                        "title":"1",
                        "payload":"an-1"
                    },
                    {
                        "content_type":"text",
                        "title":"2",
                        "payload":"an-2"
                    },
                    {
                        "content_type":"text",
                        "title":"3",
                        "payload":"an-3"
                    }
                ]
            }
        };
        return message;
    }

};