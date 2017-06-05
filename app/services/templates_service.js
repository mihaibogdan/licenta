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
    }

}