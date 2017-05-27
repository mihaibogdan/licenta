var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var _ = require('lodash');

request = request.defaults({jar: true});

var hiddenInputs = [
	'__VIEWSTATE',
	'__VIEWSTATEGENERATOR',
	'__EVENTVALIDATION'
]

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
}

var app = express();

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/', function (req, res) {
	
});

app.post('/esims_login', urlencodedParser, function (req, res) {
	payload['ctl00$mainCopy$Login1$UserName'] = req.body['ctl00$mainCopy$Login1$UserName'];
	payload['ctl00$mainCopy$Login1$Password'] = req.body['ctl00$mainCopy$Login1$Password'];

	var url = 'http://simsweb.uaic.ro/eSIMS/MyLogin.aspx?ReturnUrl=%2feSIMS%2fdefault.aspx';
    request(url, function(err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);

        _.forEach(hiddenInputs, function (input) {
        	payload[input] = $('#' + input).val();
        })

        var options = {
			method: 'post',
			form: payload,
			url: url
		}
    	request(options, function (err, response, body) {
		  if (err) {
		    console.error('error posting json: ', err)
		    throw err
		  }
		 
		  res.send('Succes!');
		})
    
    });
})

app.get('/get_note', function (req, res) {
	var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
    request(url, function(err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);

        var discipline = $('#ctl00_WebPartManagerPanel1_WebPartManager1_wp523396956_wp729632565_GridViewNote tr');

        var html = '';
		for(var i = 0; i < discipline.length; i++) {
			if (i > 0) {
				html += '<p>' + discipline[i].children[4].children[0].children[0].data + ' ' + discipline[i].children[5].children[0].children[0].data + '</p>'; 
			}
		}

        res.send(html);
    });
});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});