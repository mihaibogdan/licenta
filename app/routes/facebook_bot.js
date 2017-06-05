var express = require('express');
var router = express.Router();

var fb_bot_service = require('../services/facebook_bot_service');

router.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'esims_bot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong validation token');
    }
});

router.post('/webhook', function (req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

        data.entry.forEach(function(entry) {

            entry.messaging.forEach(function(event) {
                if (event.message) {
                    fb_bot_service.handleMessage(event)
                } else {
                    console.log("Webhook received unknown event: ", event);
                }
            });
        });
        res.sendStatus(200);
    }
});


module.exports = router;