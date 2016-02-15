/*global angular, requestAnimationFrame*/

angular.module('andrejson').controller('munchersController', function ($scope, $log, $timeout, $window) {
	'use strict';
	
	/**
	 * Loops over all functions needed to progress the simulation.
	 */
	$scope.loop = function () {
		if (Date.now() - $scope.simGlobal.stamp > 1000) {
			$scope.simGlobal.stamp = Date.now();
			$log.info('fps: ' + $scope.simGlobal.frames + ', tps: ' + $scope.simGlobal.ticks);
			$scope.simGlobal.frames = 0;
			$scope.simGlobal.ticks = 0;
		}
		if ($scope.simGlobal.frameFinished && Date.now() - $scope.simGlobal.frameStamp > 1000 / $scope.simGlobal.fps) {
			$scope.simGlobal.frameFinished = false;
			$scope.simGlobal.frameStamp = Date.now();
			requestAnimationFrame($scope.draw);
		}
		if ($scope.simGlobal.tickFinished && Date.now() - $scope.simGlobal.tickStamp > 1000 / $scope.simGlobal.tps) {
			$scope.simGlobal.tickFinished = false;
			$scope.simGlobal.tickStamp += 1000 / $scope.simGlobal.tps;
			$scope.simLoop();
		}
		$timeout($scope.loop, 5);
	};
	
	/**
	 * Redraws the screen and all its entities.
	 */
	$scope.draw = function () {
		$scope.drawBackground();
		$scope.simGlobal.frames += 1;
		$scope.simGlobal.frameFinished = true;
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
	
	$scope.simLoop = function () {
		$scope.simGlobal.ticks += 1;
		$scope.simGlobal.tickFinished = true;
	};
	
	//Keeps track of all state info.
	$scope.simGlobal = {
		stamp: undefined,
		fps: 10,
		frames: 0,
		frameStamp: undefined,
		frameFinished: true,
		tps: 50,
		ticks: 0,
		tickStamp: undefined,
		tickFinished: true
	};
	
	//Keeps track of all configurations for the simulation
	$scope.simConfig = {
		backgroundColor: "rgba(0,0,0,0.1)"
	};
	
	/**
	 * Should be called to initialize the simulation.
	 */
	$scope.init = function () {
		$scope.simGlobal.stamp = Date.now();
		$scope.simGlobal.frameStamp = Date.now();
		$scope.simGlobal.tickStamp = Date.now();
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