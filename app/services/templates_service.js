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
                "text": "Anul:",
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
    },

    batchQuickReplies: function(userID) {
        var message = {
            "recipient": {
                "id": userID
            },
            "message": {
                "text": "Semianul:",
                "quick_replies":[
                    {
                        "content_type":"text",
                        "title":"A",
                        "payload":"semian-A"
                    },
                    {
                        "content_type":"text",
                        "title":"B",
                        "payload":"semian-B"
                    }
                ]
            }
        };
        return message;
    },

    groupQuickReplies: function(userID) {
        var message = {
            "recipient": {
                "id": userID
            },
            "message": {
                "text": "Grupa:",
                "quick_replies":[
                    {
                        "content_type":"text",
                        "title":"1",
                        "payload":"grupa-1"
                    },
                    {
                        "content_type":"text",
                        "title":"2",
                        "payload":"grupa-2"
                    },
                    {
                        "content_type":"text",
                        "title":"3",
                        "payload":"grupa-3"
                    },
                    {
                        "content_type":"text",
                        "title":"4",
                        "payload":"grupa-4"
                    },
                    {
                        "content_type":"text",
                        "title":"5",
                        "payload":"grupa-5"
                    },
                    {
                        "content_type":"text",
                        "title":"6",
                        "payload":"grupa-6"
                    },
                    {
                        "content_type":"text",
                        "title":"7",
                        "payload":"grupa-7"
                    }
                ]
            }
        };
        return message;
    }

};