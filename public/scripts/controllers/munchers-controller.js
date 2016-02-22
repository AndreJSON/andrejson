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
		$timeout($scope.loop, 4);
	};
	
	/**
	 * Redraws the screen and all its entities.
	 */
	$scope.draw = function () {
		$scope.drawBackground();
		$scope.drawAnimal($scope.simGlobal.testAnimal.node, $scope.simGlobal.testAnimal.xPos, $scope.simGlobal.testAnimal.yPos);
		if ($scope.simConfig.showParticles) {
			$scope.drawPhysicsParticles($scope.simGlobal.testAnimal);
		}
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
		var i, conn, xChild, yChild;
		for (i = 0; i < node.children; i += 1) {
			conn = node.connections[i]; //An alias for the current connection.
			xChild = xPos + Math.cos(node.angle + conn.angle) * conn.length * $scope.simConfig.lengthScale;
			yChild = yPos + Math.sin(node.angle + conn.angle) * conn.length * $scope.simConfig.lengthScale;
			$scope.ctx.beginPath();
			$scope.ctx.moveTo(xPos, yPos);
			$scope.ctx.lineTo(xChild, yChild);
			$scope.ctx.strokeStyle = $scope.simConfig.connectionColor;
			$scope.ctx.stroke();
			$scope.drawAnimal(conn.node, xChild, yChild);
		}
		$scope.ctx.beginPath();
		$scope.ctx.arc(xPos, yPos, $scope.simConfig.nodeSize, 0, 2 * Math.PI);
		$scope.ctx.fillStyle = $scope.simConfig.nodeColor;
		$scope.ctx.fill();
	};
	
	$scope.drawPhysicsParticles = function (animal) {
		var i;
		$scope.ctx.fillStyle = $scope.simConfig.forceColor;
		for (i = 0; i < $scope.flapForce.xPos.length; i += 1) {
			$scope.ctx.beginPath();
			$scope.ctx.arc($scope.flapForce.xPos[i], $scope.flapForce.yPos[i], $scope.simConfig.nodeSize, 0, 2 * Math.PI);
			$scope.ctx.fill();
		}
		$scope.ctx.beginPath();
		$scope.ctx.arc(animal.xMass, animal.yMass, $scope.simConfig.nodeSize, 0, 2 * Math.PI);
		$scope.ctx.fillStyle = $scope.simConfig.massColor;
		$scope.ctx.fill();
	};
	
	$scope.simTick = function () {
		$scope.moveAnimal($scope.simGlobal.testAnimal);
	};
	
	$scope.moveAnimal = function (animal) {
		$scope.flapForce = {xPos: [], yPos: [], xF: [], yF: []};
		animal.calculateMassCenter();
		$scope.flapChildren(animal.node, 0);
		$scope.calculateFlapForce($scope.flapForce, animal.node, animal.xPos, animal.yPos);
		$log.info($scope.flapForce.yPos[1]);
		//TODO: Calculate forces from drag.
		//TODO: Calculate new velocity from forces.
		animal.xPos += animal.xVel;
		animal.yPos += animal.yVel;
	};
	
	$scope.flapChildren = function (node, angleChange) {
		var i, conn;
		for (i = 0; i < node.children; i += 1) {
			conn = node.connections[i]; //Creating an alias for the targeted connection
			if (conn.frameCount === (conn.expanding ? conn.expFrames : conn.conFrames)) {
				conn.expanding = !conn.expanding;
				conn.frameCount = 0;
			}
			conn.frameCount += 1;
			conn.angle += conn.expanding ? conn.expVel : conn.conVel;
			conn.node.angle += angleChange + (conn.expanding ? conn.expVel : conn.conVel);
			$scope.flapChildren(conn.node, angleChange + (conn.expanding ? conn.expVel : conn.conVel));
		}
	};
	
	$scope.calculateFlapForce = function (accum, node, x, y) {
		var i, conn, deltaX, deltaY;
		for (i = 0; i < node.children; i += 1) {
			conn = node.connections[i];
			deltaX = Math.cos(node.angle + conn.angle) * conn.length * $scope.simConfig.lengthScale;
			deltaY = Math.sin(node.angle + conn.angle) * conn.length * $scope.simConfig.lengthScale;
			accum.xPos.push(x + deltaX * Math.pow(1 / 2, 1 / 3));
			accum.yPos.push(y + deltaY * Math.pow(1 / 2, 1 / 3));
			//accum.xF
			//accum.yF
			$scope.calculateFlapForce(accum, conn.node, x + deltaX, y + deltaY);
		}
	};
	
	$scope.animal = function () {
		this.node = new $scope.node();
		this.xVel = 0;
		this.yVel = 0;
		this.xPos = $scope.windowWidth / 2;	//The x-wise position of the root node.
		this.yPos = $scope.windowHeight / 2;//The y-wise position of the root node.
		this.xMass = 0;	//The x-wise center of mass.
		this.yMass = 0;	//The y-wise center of mass.
		function massCrawl(accum, node, x, y) {
			var i, conn, nodeX, nodeY;
			for (i = 0; i < node.children; i += 1) {
				conn = node.connections[i];
				nodeX = x + Math.cos(node.angle + conn.angle) * conn.length * $scope.simConfig.lengthScale;
				nodeY = y + Math.sin(node.angle + conn.angle) * conn.length * $scope.simConfig.lengthScale;
				accum.x.push(nodeX);
				accum.y.push(nodeY);
				massCrawl(accum, conn.node, nodeX, nodeY);
			}
		}
		this.calculateMassCenter = function () {
			var accum = {x: [], y: [] }; //An accumulator for node positions.
			accum.x.push(this.xPos);
			accum.y.push(this.yPos);
			massCrawl(accum, this.node, this.xPos, this.yPos);
			this.xMass = accum.x.reduce(function (a, b) {return a + b; }, 0) / accum.x.length;
			this.yMass = accum.y.reduce(function (a, b) {return a + b; }, 0) / accum.y.length;
		};
	};
	
	$scope.node = function () {
		this.angle = 0;
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
		this.frameCount = 0;							//Counter to keep track of when to change direction.
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
		fps: 6,
		tps: 10,
		backgroundColor: "rgba(210,210,210,1)",
		nodeColor: "rgba(20,110,150,0.9)",
		connectionColor: "rgba(50,50,50,0.8)",
		massColor: "rgba(200,0,0,1)",
		forceColor: "rgba(200,0,200,1)",
		maxFlapSpeed: 1, //Chosen arbitrarily, may likely need to change later.
		nodeSize: 5,
		lengthScale: 0.5,
		showParticles: true
	};
	
	/**
	 * Should be called to initialize the simulation.
	 */
	$scope.init = function () {
		$scope.simGlobal.testAnimal = new $scope.animal();
		$scope.simGlobal.testAnimal.node.addChild(new $scope.connection(0, 1, 6, 10, 100));
		$scope.simGlobal.testAnimal.node.addChild(new $scope.connection(Math.PI, Math.PI - 1, 6, 10, 100));
		$scope.simGlobal.testAnimal.node.connections[0].node.addChild(new $scope.connection(0, 0.3, 6, 10, 100));
		$scope.simGlobal.testAnimal.node.connections[1].node.addChild(new $scope.connection(Math.PI, Math.PI - 0.3, 6, 10, 100));
		$scope.simGlobal.testAnimal.node.connections[0].node.connections[0].node.addChild(new $scope.connection(0, 0.3, 6, 10, 100));
		$scope.simGlobal.testAnimal.node.connections[1].node.connections[0].node.addChild(new $scope.connection(Math.PI, Math.PI - 0.3, 6, 10, 100));
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