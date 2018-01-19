var Promise = require('promise');
var cheerio = require('cheerio');

var _ = require('lodash');

var firebase = require('../lib/firebase');
var communication_service = require('./communication_service');

var hiddenInputs = [
    '__VIEWSTATE',
    '__VIEWSTATEGENERATOR',
    '__EVENTVALIDATION'
];

var payloadsGrades = {
    '__WPPS': 'u',
    '__EVENTTARGET': 'ctl00$WebPartManagerPanel1$WebPartManager1$wp1153997053$wp964809087$gridStudenti',
    '__EVENTARGUMENT': 'Select$0',
    '__VIEWSTATE': '',
    '__VIEWSTATEGENERATOR': '',
    '__VIEWSTATEENCRYPTED': '',
    '__EVENTVALIDATION': ''
};


module.exports = {
    getPayload: function() {
        var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
        request(url, function(err, resp, body) {
            if (err)
                throw err;
            var $ = cheerio.load(body);

            _.forEach(hiddenInputs, function (input) {
                payloadsGrades[input] = $('#' + input).val();
            });

            resolve(payloadsGrades)
        });
    },

    getMarks: function(semester, payload) {
        var marks = [];
        var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
        console.log(payload);
        payload.__EVENTARGUMENT = 'Select$' + semester;
        var options = {
            method: 'post',
            form: payload,
            url: url
        };

        return new Promise(function(resolve, reject) {
            request(options, function(err, resp, body) {
                if (err)
                    throw err;
                var $ = cheerio.load(body);

                var discipline = $('#ctl00_WebPartManagerPanel1_WebPartManager1_wp523396956_wp729632565_GridViewNote tr');


                for(var i = 0; i < discipline.length; i++) {
                    if (i > 0) {
                        marks.push({ name: discipline[i].children[4].children[0].children[0].data, value: discipline[i].children[5].children[0].children[0].data})
                    }
                }

                resolve(marks);
            });
        })
    }
};