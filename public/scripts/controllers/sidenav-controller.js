/*global angular*/

angular.module('andrejson')
	.controller('sidenavController', function ($scope, $log, $mdSidenav) {
		'use strict';
		$scope.closeLeft = function () {
			$mdSidenav('left').close();
		};
	});