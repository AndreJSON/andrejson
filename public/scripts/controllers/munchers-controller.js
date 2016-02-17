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
		$scope.drawAnimal($scope.simGlobal.testAnimal.node, $scope.simGlobal.testAnimal.xPos, $scope.simGlobal.testAnimal.yPos);
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
	
	$scope.drawAnimal = function (node, xPos, yPos) {
		var i, xChild, yChild;
		for (i = 0; i < node.children; i += 1) {
			xChild = xPos + Math.cos(node.connections[i].angle) * node.connections[i].length / $scope.simConfig.nodeSize;
			yChild = yPos + Math.sin(node.connections[i].angle) * node.connections[i].length / $scope.simConfig.nodeSize;
			$scope.ctx.beginPath();
			$scope.ctx.moveTo(xPos, yPos);
			$scope.ctx.lineTo(xChild, yChild);
			$scope.ctx.strokeStyle = $scope.simConfig.connectionColor;
			$scope.ctx.stroke();
			$scope.drawAnimal(node.connections[i].node, xChild, yChild);
		}
		$scope.ctx.beginPath();
		$scope.ctx.arc(xPos, yPos, $scope.simConfig.nodeSize, 0, 2 * Math.PI);
		$scope.ctx.fillStyle = $scope.simConfig.nodeColor;
		$scope.ctx.fill();
	};
	
	$scope.simTick = function () {
		$scope.moveAnimal($scope.simGlobal.testAnimal);
	};
	
	$scope.moveAnimal = function (animal) {
		$scope.flapChildren(animal.node);
		animal.xPos += animal.xVel;
		animal.yPos += animal.yVel;
	};
	
	$scope.flapChildren = function (node) {
		var i, conn;
		for (i = 0; i < node.children; i += 1) {
			conn = node.connections[i]; //Creating an alias for the targeted connection
			if (conn.frameCount === (conn.expanding ? conn.expFrames : conn.conFrames)) {
				conn.expanding = !conn.expanding;
				conn.frameCount = 0;
			}
			conn.angle += conn.expanding ? conn.expVel : conn.conVel;
			conn.frameCount += 1;
		}
	};
	
	$scope.animal = function () {
		this.node = new $scope.node();
		this.xVel = 0;
		this.yVel = 0;
		this.xPos = $scope.windowWidth / 2;
		this.yPos = $scope.windowHeight / 2;
		this.angle = 0;
	};
	
	$scope.node = function () {
		this.children = 0;
		this.connections = [];
		this.addChild = function (connection) {
			this.children += 1;
			this.connections.push(connection);
		};
	};
	
	$scope.connection = function (conAngle, expAngle, expFrames, conFrames, length) {
		this.angle = conAngle;							//The current angle.
		this.expVel = (expAngle - conAngle) / expFrames;//The expansion angle velocity.
		this.conVel = (conAngle - expAngle) / conFrames;//The contraction angle velocity.
		this.expanding = true;							//Set to true when the wing is expanding.
		this.expFrames = expFrames;						//How many frames the wing expands.
		this.conFrames = conFrames;						//How many frames the wing contracts.
		this.frameCount = 0;								//Counter to keep track of when to change direction.
		this.length = length;							//The length of the connection to the child node.
		this.node = new $scope.node();					//The child node.
	};
	
	//Keeps track of all state info.
	$scope.simGlobal = {
		stamp: undefined,
		frames: 0,
		frameStamp: undefined,
		frameFinished: true,
		ticks: 0,
		tickStamp: undefined,
		testAnimal: undefined
	};
	
	//Keeps track of all configurations for the simulation
	$scope.simConfig = {
		fps: 30,
		tps: 10,
		backgroundColor: "rgba(210,210,210,1)",
		nodeColor: "rgba(20,110,150,0.9)",
		connectionColor: "rgba(50,50,50,0.8)",
		maxFlapSpeed: 1, //Chosen arbitrarily, may likely need to change later.
		nodeSize: 5
	};
	
	/**
	 * Should be called to initialize the simulation.
	 */
	$scope.init = function () {
		$scope.simGlobal.testAnimal = new $scope.animal();
		$scope.simGlobal.testAnimal.node.addChild(new $scope.connection(0, 1, 6, 10, 100));
		$scope.simGlobal.testAnimal.node.addChild(new $scope.connection(Math.PI, Math.PI - 1, 6, 10, 100));
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