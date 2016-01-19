/*global angular*/

angular.module('andrejson')
	.controller('toolbarController', function ($scope, $log, $mdSidenav) {
		'use strict';
		$scope.openLeft = function () {
			$mdSidenav('left').open();
		};
	});