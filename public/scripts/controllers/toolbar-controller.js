/*global angular*/

angular.module('andrejson')
	.controller('toolbarController', function ($scope, $location, $log, $mdSidenav) {
		'use strict';
	
		$scope.getPath = function () {
			var path, firstLetter;
			path = $location.path().substr(1);
			path = path.replace('-', ' ');
			firstLetter = path.substring(0, 1);
			firstLetter = firstLetter.toUpperCase();
			path = path.slice(1);
			return firstLetter + path;
		};
	
		$scope.openLeft = function () {
			$mdSidenav('left').open();
		};
	});