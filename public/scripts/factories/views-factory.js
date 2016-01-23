/*global angular*/

angular.module('andrejson')
	.factory('viewsFactory', function () {
		'use strict';
		var view, data;
		
		data = {
			views: [
				{hash: '/home', name: 'Home'},
				{hash: '/about-me', name: 'About Me'}
			],
			names: []
		};
		function addToNames(element) {
			data.names.push(element.name);
		}
		data.views.forEach(addToNames); //Generate data.names for O(1) future use.
		return data;
	});