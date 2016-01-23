/*global angular*/

angular.module('andrejson')
	.controller('sidenavController', function ($scope, $log, $mdSidenav, viewsFactory) {
		'use strict';

		$scope.viewsData = viewsFactory;
	
		$scope.closeLeft = function () {
			$mdSidenav('left').close();
		};
	});