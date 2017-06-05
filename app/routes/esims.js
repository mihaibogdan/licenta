var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jwon-web-token');

var facebook_bot_service = require('../services/facebook_bot_service')();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/login', urlencodedParser, function (req, res) {
    if (req.body && req.body.redirect_uri) {
        var username = req.body['ctl00$mainCopy$Login1$UserName'];
        var password = req.body['ctl00$mainCopy$Login1$Password'];
        var redirect_uri = req.body['redirect_uri'];

        facebook_bot_service.login(username, password).then(function () {
            var payload = { username: username, password: password };
            var secret = process.env.JWT_SECRET;

            jwt.encode(secret, payload, function (err, token) {
                if (err) {
                    console.error(err.name, err.message);
                } else {
                    var redirectUri = redirect_uri + '&authorization_code=' + token;
                    return res.redirect(redirectUri);
                }
            });

        })


    } else {
        return res.send(400, 'Request did not contain redirect_uri in the query string');
    }
});


module.exports = router;