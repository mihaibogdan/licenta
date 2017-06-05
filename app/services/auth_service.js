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
                                module.exports.login(decodedPayload.username, decodedPayload.password).then(function() {
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

    },
    login: function(username, password) {
        return new Promise(function(resolve, reject) {
            payload['ctl00$mainCopy$Login1$UserName'] = username;
            payload['ctl00$mainCopy$Login1$Password'] = password;

            var url = 'http://simsweb.uaic.ro/eSIMS/MyLogin.aspx?ReturnUrl=%2feSIMS%2fdefault.aspx';
            request(url, function(err, resp, body) {
                if (err)
                    throw err;
                $ = cheerio.load(body);

                _.forEach(hiddenInputs, function (input) {
                    payload[input] = $('#' + input).val();
                });

                var options = {
                    method: 'post',
                    form: payload,
                    url: url
                };

                request(options, function (err, response, body) {
                    if (err) {
                        console.error('error posting json: ', err);
                        reject();
                    }

                    resolve();
                })

            });
        })
    }
};