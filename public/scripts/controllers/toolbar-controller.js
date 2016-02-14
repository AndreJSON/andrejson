/*global angular*/

angular.module('andrejson').controller('toolbarController', function ($scope, $location, $log, $mdSidenav, viewsFactory) {
	'use strict';

	$scope.viewsData = viewsFactory;

	$scope.getViewName = function () {
		var i, path = $location.path();
		for (i = 0; i < $scope.viewsData.views.length; i += 1) {
			if ($scope.viewsData.views[i].hash === path) {
				return $scope.viewsData.views[i].name;
			}
		}
		return "Error";
	};

	$scope.openLeft = function () {
		$mdSidenav('left').open();
	};
});