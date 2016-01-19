/*global angular*/

angular.module('andrejson')
	.controller('sidenavController', function ($scope, $log, $mdSidenav) {
		'use strict';
	
		$scope.views = [
			'about-me',
			'home'
		];
	
		$scope.closeLeft = function () {
			$mdSidenav('left').close();
		};
	});