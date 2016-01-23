/*global angular*/

angular.module('andrejson')
	.factory('viewsFactory', function () {
		'use strict';
		var data = {
			views: [
				'home',
				'about-me'
			]
		};
		return data;
	});