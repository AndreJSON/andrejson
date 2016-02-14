/*global angular*/

angular.module('andrejson').directive('munchersDirective', function () {
	'use strict';
	return {
		restrict: 'E',
		templateUrl: 'templates/munchers-template.html',
		scope: {
			windowWidth: '=',
			windowHeight: '='
		},
		link: function (scope, element) {
			scope.canvas = element.find('canvas')[0].getContext('2d');
		},
		controller: 'munchersController'
	};
});