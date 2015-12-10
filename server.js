/*jslint node: true, nomen: true, es5: true*/
'use strict';

//Getting it all started.
var express = require('express');
var app = express();

//Traffic routing.
var port = 8080;
app.use(express.static(__dirname + '/public'));
app.listen(port);

console.log("Server is now listening on port: " + port);