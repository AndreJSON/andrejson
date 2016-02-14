/*global angular, requestAnimationFrame*/

angular.module('andrejson').controller('munchersController', function ($scope, $log, $timeout, $window) {
	'use strict';
	
	/**
	 * Loops over all functions needed to progress the simulation.
	 */
	$scope.loop = function () {
		//TODO: use timestamp and reqanimframe to balance crunching and framerates.
		$scope.draw();
		requestAnimationFrame($scope.loop);
	};
	
	/**
	 * Redraws the screen and all its entities.
	 */
	$scope.draw = function () {
		$scope.drawBackground();
	};
	
	/**
	 * Subroutine to draw. Draws the background.
	 */
	$scope.drawBackground = function () {
		$scope.ctx.beginPath();
		$scope.ctx.rect(0, 0, $scope.windowWidth, $scope.windowHeight);
		$scope.ctx.fillStyle = $scope.simConfig.backgroundColor;
		$scope.ctx.fill();
	};
	
	//Keeps track of all configurations for the simulation
	$scope.simConfig = {
		backgroundColor: "rgb(0,0,0)"
	};
	
	/**
	 * Should be called to initialize the simulation.
	 */
	$scope.init = function () {
		$scope.loop();
	};
	
	/**
	 * Automatically called when page has loaded.
	 */
	$timeout(function () {
		$scope.windowWidth = $window.innerWidth * 0.8;
		$scope.windowHeight = $window.innerHeight * 0.8;
		$scope.init();
	});
});