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
    console.log(process.env.JWT_SECRET);
    console.log(process.env.PAGE_ACCESS_TOKEN);
    jwt.encode(secret, payload, function (err, token) {
        if (err) {
            console.error(err.name, err.message);
        } else {
            res.send(token);
        }
    });

});

app.use('/facebook_bot', facebook_bot);
app.use('/esims', esims);

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port 5000!');
});