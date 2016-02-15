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
		if ($scope.simGlobal.frameFinished && Date.now() - $scope.simGlobal.frameStamp > 1000 / $scope.simConfig.fps) {
			$scope.simGlobal.frameFinished = false;
			$scope.simGlobal.frameStamp = Date.now();
			requestAnimationFrame(function () {
				$scope.draw();
				$scope.simGlobal.frames += 1;
				$scope.simGlobal.frameFinished = true;
			});
		}
		if (Date.now() - $scope.simGlobal.tickStamp > 1000 / $scope.simConfig.tps) {
			$scope.simGlobal.tickStamp += 1000 / $scope.simConfig.tps;
			$scope.simTick();
			$scope.simGlobal.ticks += 1;
		}
		$timeout($scope.loop, 5);
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
	
	$scope.simTick = function () {
	};
	
	$scope.animal = function () {
		this.node = new $scope.Node();
		this.nodeConn = [];
	};
	
	$scope.node = function () {
		this.children = 0;
		this.connections = [];
		this.addChild = function (node) {
			this.children += 1;
			this.connections.push(node);
		};
	};
	
	$scope.connection = function (angle, restAngle, expAngle, expSpeed, conSpeed, length, node) {
		this.angle = angle;			//Current angle.
		this.restAngle = restAngle;	//The angle when fully contracted. [0,2pi).
		this.expAngle = expAngle;	//The angle when fully expanded. Can be > 2pi.
		this.expanding = true;		//Set to true if the wing is currently expanding, false when contracting.
		this.expSpeed = expSpeed;	//The speed of expansion. This must be a positive value, restricted by a max value.
		this.conSpeed = conSpeed;	//The speed of contraction. This must be a positive value, restricted by a max value.
		this.length = length;		//The length of the connection to the child node.
		this.node = node;			//The child node.
	};
	
	//Keeps track of all state info.
	$scope.simGlobal = {
		stamp: undefined,
		frames: 0,
		frameStamp: undefined,
		frameFinished: true,
		ticks: 0,
		tickStamp: undefined
	};
	
	//Keeps track of all configurations for the simulation
	$scope.simConfig = {
		fps: 30,
		tps: 10,
		backgroundColor: "rgba(210,210,210,1)",
		nodeColor: "rgba(20,110,150,0.9)",
		connectionColor: "rgba(50,50,50,0.8)",
		maxFlapSpeed: 1 //Chosen arbitrarily, may likely need to change later.
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