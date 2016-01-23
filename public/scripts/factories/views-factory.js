/*global angular*/

angular.module('andrejson')
	.factory('viewsFactory', function () {
		'use strict';
		var view, data;
		
		data = {
			views: [
				{hash: '/home', name: 'Home'},
				{hash: '/about-me', name: 'About Me'}
			]
		};
		return data;
	});