/*jslint node: true, nomen: true, es5: true*/
'use strict';

var express = require('express');
var app = express();
var port = 8080;

app.use(express.static(__dirname + '/public'));
app.listen(port);

console.log("Server is now listening on port: " + port);