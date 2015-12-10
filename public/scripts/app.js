/*global angular */

var app = angular.module('app', ['ngMaterial', 'ngRoute']);

app.config(function ($routeProvider) {
	'use strict';
	
	$routeProvider
		.when('/', {
			templateUrl: 'views/home.html'
		})
		.when('/home', {
			templateUrl: 'views/home.html'
		})
		.otherwise({
			templateUrl: 'views/404.html'
		});
});