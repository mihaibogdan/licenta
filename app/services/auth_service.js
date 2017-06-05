var request = require('request');
var Promise = require('promise');
var cheerio = require('cheerio');
var jwt = require('json-web-token');

var firebase = require('../lib/firebase');

var PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

module.exports = {
    verifyIfLoggedIn: function () {
        return new Promise(function(resolve, reject) {
            var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
            request(url, function(err, resp, body) {
                if (err)
                    throw err;
                $ = cheerio.load(body);

                if ($('#ctl00_mainCopy_Login1_UserName')) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
        })
    },
    keepConnectionAlive: function (userID) {
        return new Promise(function(resolve, reject) {
            module.exports.verifyIfLoggedIn().then(function(loggedIn) {
                if (!loggedIn) {
                    firebase.database.ref('users/' + userID).once('value', function(snapshot) {
                        var user = snapshot.val();

                        if (!user) {
                            sendLoginButton(userID)
                            reject();
                        } else {
                            jwt.decode(process.env.JWT_SECRET, user, function (err_, decodedPayload, decodedHeader) {
                                login(decodedPayload.username, decodedPayload.password).then(function() {
                                    resolve();
                                })
                            });
                        }
                    })
                } else {
                    resolve();
                }
            })
        })

    }
};