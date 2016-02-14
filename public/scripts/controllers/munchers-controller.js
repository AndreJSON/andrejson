/*global angular*/

angular.module('andrejson')
	.controller('munchersController', function ($scope, $log, $timeout, $window) {
		'use strict';
	
		$timeout(function () {
			$scope.windowWidth = $window.innerWidth * 0.8;
			$scope.windowHeight = $window.innerHeight * 0.8;
		});
	});