var express = require('express');
var bodyParser = require('body-parser');

var facebook_bot = require('./app/routes/facebook_bot');
var esims = require('./app/routes/esims');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/static/index.html', function (req, res) {
   res.sendFile( __dirname + "/static/" + "index.html" );
});

app.get('/', function (req, res) {
    res.send('Hello world');
});

app.use('/facebook_bot', facebook_bot);
app.use('/esims', esims);

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port 5000!');
});