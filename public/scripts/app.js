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

app.config(function ($mdThemingProvider) {
	$mdThemingProvider.theme('default')
		.primaryPalette('teal', {
			'default': '500',
			'hue-1': '100',
			'hue-2': '600',
			'hue-3': 'A100'
		})
		.accentPalette('purple', {
			'default': '200'
		});
});