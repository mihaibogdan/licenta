var express = require('express');
var bodyParser = require('body-parser');

var facebook_bot = require('./app/routes/facebook_bot');
var esims = require('./app/routes/esims');

var jwt = require('json-web-token');
var payload = { foo: 'bar' };
var secret = process.env.JWT_SECRET;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/static/index.html', function (req, res) {
   res.sendFile( __dirname + "/static/" + "index.html" );
});

app.get('/', function (req, res) {
    jwt.encode(secret, payload, function (err, token) {
        if (err) {
            console.error(err.name, err.message);
        } else {


            // decode
            jwt.decode(secret + 'adasda', token, function (err_, decodedPayload, decodedHeader) {
                if (err) {
                    console.error(err.name, err.message);
                } else {
                    console.log(decodedPayload, decodedHeader);
                    res.send(token);
                }
            });
        }
    });

});

app.use('/facebook_bot', facebook_bot);
app.use('/esims', esims);

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port 5000!');
});