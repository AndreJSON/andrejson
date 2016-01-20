/*global angular*/

angular.module('andrejson')
	.controller('mainController', function ($scope, $location, $log, $timeout, $mdSidenav) {
		'use strict';
		$timeout(function () {
			if ($location.path() === '/') {
				$location.path('home');
			}
		});
	});