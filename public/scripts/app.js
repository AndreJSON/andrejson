/*global angular */

var app = angular.module('app', ['ngMaterial', 'ngRoute', 'ngMdIcons']);

app.config(function ($routeProvider) {
	'use strict';
	
	$routeProvider
		.when('/', {
			templateUrl: 'views/home.html'
		})
		.when('/home', {
			templateUrl: 'views/home.html'
		})
		.when('/about-me', {
			templateUrl: 'views/about-me.html'
		})
		.otherwise({
			templateUrl: 'views/404.html'
		});
});