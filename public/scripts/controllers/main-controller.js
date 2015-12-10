/*global app*/

app.controller('mainController', function ($scope, $log, $mdSidenav) {
	'use strict';
	$scope.openLeft = function () {
		$mdSidenav('left').open();
	};
});