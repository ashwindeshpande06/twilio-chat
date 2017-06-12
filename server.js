//
// # SimpleServer
//
// A simple chat server using Express
//
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
const app = express();

var api = require("./app/routes/api")(app, express);

app.use(express.static(path.join(__dirname, 'client')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use('/api', api);

app.get('/customer/chat', function (req, res, next) {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/agent/chat', function (req, res, next) {
  res.sendFile(__dirname + '/client/index2.html');
});

app.listen(process.env.PORT || 3000, function () {

  console.log("Chat server listening at", process.env.PORT);
});
