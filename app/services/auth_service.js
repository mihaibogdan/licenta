var request = require('request');
var Promise = require('promise');
var cheerio = require('cheerio');
var jwt = require('json-web-token');

var _ = require('lodash');

var firebase = require('../lib/firebase');
var templates_service = require('./templates_service');


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
                console.log(loggedIn, 'loggedIn')
                if (!loggedIn) {
                    firebase.database.ref('users/' + userID).once('value', function(snapshot) {
                        var user = snapshot.val();
                        console.log('user', user);
                        if (!user) {
                            templates_service.sendLoginButton(userID);
                            reject();
                        } else {
                            jwt.decode(process.env.JWT_SECRET, user, function (err_, decodedPayload, decodedHeader) {
                                console.log('decodedPayload', decodedPayload);
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