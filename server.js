// init project
let express = require('express');
let app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/test", function (request, response) {
  response.sendFile(__dirname + '/views/test.html');
});

app.get("/research", function (request, response) {
  response.sendFile(__dirname + '/views/research.html');
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/log", function (request, response) {
  response.sendFile(__dirname + '/views/log.html');
});

app.get("/explore", function (request, response) {
  response.sendFile(__dirname + '/views/explore.html');
});



// listen for requests :)
let listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});