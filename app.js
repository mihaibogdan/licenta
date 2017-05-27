var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var _ = require('lodash');

var PAGE_ACCESS_TOKEN = 'EAAGHOUlg6hYBACbz4EgqOvhP9i17OyHfeZCc2pOyZCqFtSGsOnH54EVH23rW4WErIzXibpyHdrWhCclFivmfZAsXZCQwsdbL5xg1hvk1SQG0zUuK3FFYEbVhBbZBqhEjDgTPStSZBc8iGbhIi9Sh2mBnjjxDM5euhfgxbx1V2LMQZDZD';

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

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/', function (req, res) {
	res.send('Hello world!');
});

app.get('/webhook', function (req, res) {
	if (req.query['hub.verify_token'] === 'esims_bot_verify_token') {
	  res.send(req.query['hub.challenge']);
	} else {
	  res.send('Error, wrong validation token');    
	}
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
	console.log('callSendAPI', messageData);
	console.log('page access token', PAGE_ACCESS_TOKEN );
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

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



app.listen(process.env.PORT, function () {
  console.log('Example app listening on port 3000!');
});