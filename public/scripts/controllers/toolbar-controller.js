/*global app*/

app.controller('toolbarController', function ($scope, $log, $mdSidenav) {
	'use strict';
	$scope.openLeft = function () {
		$mdSidenav('left').open();
	};
});