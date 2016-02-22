/*global angular, requestAnimationFrame*/

angular.module('andrejson').controller('munchersController', function ($scope, $log, $timeout, $window) {
	'use strict';
	var sim = {};
	/**
	 * Loops over all functions needed to progress the simulation.
	 */
	sim.loop = function () {
		if (Date.now() - sim.global.stamp > 1000) {
			sim.global.stamp = Date.now();
			$log.info('fps: ' + sim.global.frames + ', tps: ' + sim.global.ticks);
			sim.global.frames = 0;
			sim.global.ticks = 0;
		}
		if (sim.global.frameFinished && Date.now() - sim.global.frameStamp > 1000 / $scope.simConfig.fps) {
			sim.global.frameFinished = false;
			sim.global.frameStamp = Date.now();
			requestAnimationFrame(function () {
				sim.draw();
				sim.global.frames += 1;
				sim.global.frameFinished = true;
			});
		}
		if (Date.now() - sim.global.tickStamp > 1000 / $scope.simConfig.tps) {
			sim.global.tickStamp += 1000 / $scope.simConfig.tps;
			sim.tick();
			sim.global.ticks += 1;
		}
		$timeout(sim.loop, 4);
	};
	
	/**
	 * Redraws the screen and all its entities.
	 */
	sim.draw = function () {
		sim.drawBackground();
		sim.drawAnimal(sim.global.testAnimal.node, sim.global.testAnimal.xPos, sim.global.testAnimal.yPos);
		if ($scope.simConfig.showParticles) {
			sim.drawPhysicsParticles(sim.global.testAnimal);
		}
	};
	
	/**
	 * Subroutine to draw. Draws the background.
	 */
	sim.drawBackground = function () {
		$scope.ctx.beginPath();
		$scope.ctx.rect(0, 0, $scope.windowWidth, $scope.windowHeight);
		$scope.ctx.fillStyle = $scope.simConfig.backgroundColor;
		$scope.ctx.fill();
	};
	
	sim.drawAnimal = function (node, xPos, yPos) {
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
			sim.drawAnimal(conn.node, xChild, yChild);
		}
		$scope.ctx.beginPath();
		$scope.ctx.arc(xPos, yPos, $scope.simConfig.nodeSize, 0, 2 * Math.PI);
		$scope.ctx.fillStyle = $scope.simConfig.nodeColor;
		$scope.ctx.fill();
	};
	
	sim.drawPhysicsParticles = function (animal) {
		var i;
		$scope.ctx.fillStyle = $scope.simConfig.forceColor;
		for (i = 0; i < animal.forces.xPos.length; i += 1) {
			$scope.ctx.beginPath();
			$scope.ctx.arc(animal.forces.xPos[i], animal.forces.yPos[i], $scope.simConfig.nodeSize, 0, 2 * Math.PI);
			$scope.ctx.fill();
		}
		$scope.ctx.beginPath();
		$scope.ctx.arc(animal.xMass, animal.yMass, $scope.simConfig.nodeSize, 0, 2 * Math.PI);
		$scope.ctx.fillStyle = $scope.simConfig.massColor;
		$scope.ctx.fill();
	};
	
	sim.tick = function () {
		sim.moveAnimal(sim.global.testAnimal);
	};
	
	sim.moveAnimal = function (animal) {
		sim.calculateMassCenter(animal);
		sim.flapChildren(animal.node, 0);
		animal.resetForces();
		sim.calculateFlapForce(animal.forces, animal.node, animal.xPos, animal.yPos);
		//TODO: Calculate forces from drag.
		//TODO: Calculate new velocity from forces.
		animal.xPos += animal.xVel;
		animal.yPos += animal.yVel;
	};
	
	sim.calculateFlapForce = function (accum, node, x, y) {
		var i, conn, deltaX, deltaY;
		for (i = 0; i < node.children; i += 1) {
			conn = node.connections[i];
			deltaX = Math.cos(node.angle + conn.angle) * conn.length * $scope.simConfig.lengthScale;
			deltaY = Math.sin(node.angle + conn.angle) * conn.length * $scope.simConfig.lengthScale;
			accum.xPos.push(x + deltaX * Math.pow(1 / 2, 1 / 3));
			accum.yPos.push(y + deltaY * Math.pow(1 / 2, 1 / 3));
			//accum.xF
			//accum.yF
			sim.calculateFlapForce(accum, conn.node, x + deltaX, y + deltaY);
		}
	};
	
	sim.calculateMassCenter = function (animal) {
		var accum = {x: [], y: [] }; //An accumulator for node positions.
		accum.x.push(animal.xPos);
		accum.y.push(animal.yPos);
		(function crawl(accum, node, x, y) { //Anonymous function that crawls down all descendant nodes.
			var i, conn, nodeX, nodeY;
			for (i = 0; i < node.children; i += 1) {
				conn = node.connections[i];
				nodeX = x + Math.cos(node.angle + conn.angle) * conn.length * $scope.simConfig.lengthScale;
				nodeY = y + Math.sin(node.angle + conn.angle) * conn.length * $scope.simConfig.lengthScale;
				accum.x.push(nodeX);
				accum.y.push(nodeY);
				crawl(accum, conn.node, nodeX, nodeY);
			}
		}(accum, animal.node, animal.xPos, animal.yPos));
		animal.xMass = accum.x.reduce(function (a, b) {return a + b; }, 0) / accum.x.length;
		animal.yMass = accum.y.reduce(function (a, b) {return a + b; }, 0) / accum.y.length;
	};
	
	sim.flapChildren = function (node, angleChange) {
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
			sim.flapChildren(conn.node, angleChange + (conn.expanding ? conn.expVel : conn.conVel));
		}
	};
	
	sim.animal = function () {
		this.node = new sim.node();
		this.xVel = 0;
		this.yVel = 0;
		this.xPos = $scope.windowWidth / 2;	//The x-wise position of the root node.
		this.yPos = $scope.windowHeight / 2;//The y-wise position of the root node.
		this.xMass = 0;	//The x-wise center of mass.
		this.yMass = 0;	//The y-wise center of mass.
		this.forces = {xPos: [], yPos: [], xF: [], yF: []};
	};
	
	sim.animal.prototype.resetForces = function () {
		this.forces = {xPos: [], yPos: [], xF: [], yF: []};
	};
	
	sim.node = function () {
		this.angle = 0;
		this.children = 0;
		this.connections = [];
		this.addChild = function (connection) {
			this.children += 1;
			this.connections.push(connection);
		};
	};
	
	sim.connection = function (conAngle, expAngle, expFrames, conFrames, length) {
		this.angle = conAngle;							//The current angle.
		this.expVel = (expAngle - conAngle) / expFrames;//The expansion angle velocity.
		this.conVel = (conAngle - expAngle) / conFrames;//The contraction angle velocity.
		this.expanding = true;							//Set to true when the wing is expanding.
		this.expFrames = expFrames;						//How many frames the wing expands.
		this.conFrames = conFrames;						//How many frames the wing contracts.
		this.frameCount = 0;							//Counter to keep track of when to change direction.
		this.length = length;							//The length of the connection to the child node.
		this.node = new sim.node();						//The child node.
	};
	
	//Keeps track of all state info.
	sim.global = {
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
		fps: 60,
		tps: 10,
		backgroundColor: "rgba(210,210,210,1)",
		nodeColor: "rgba(20,110,150,0.9)",
		connectionColor: "rgba(50,50,50,0.8)",
		massColor: "rgba(200,0,0,1)",
		forceColor: "rgba(200,0,200,1)",
		maxFlapSpeed: 1, //Chosen arbitrarily, may likely need to change later.
		nodeSize: 7,
		lengthScale: 0.35,
		showParticles: true
	};
	
	/**
	 * Should be called to initialize the simulation.
	 */
	sim.init = function () {
		sim.global.testAnimal = new sim.animal();
		sim.global.testAnimal.node.addChild(new sim.connection(0, 1, 6, 10, 100));
		sim.global.testAnimal.node.addChild(new sim.connection(Math.PI, Math.PI - 1, 6, 10, 100));
		sim.global.testAnimal.node.connections[0].node.addChild(new sim.connection(0, 0.3, 6, 10, 100));
		sim.global.testAnimal.node.connections[1].node.addChild(new sim.connection(Math.PI, Math.PI - 0.3, 6, 10, 100));
		sim.global.testAnimal.node.connections[0].node.connections[0].node.addChild(new sim.connection(0, 0.3, 6, 10, 100));
		sim.global.testAnimal.node.connections[1].node.connections[0].node.addChild(new sim.connection(Math.PI, Math.PI - 0.3, 6, 10, 100));
		sim.global.stamp = Date.now();
		sim.global.frameStamp = Date.now();
		sim.global.tickStamp = Date.now();
		sim.loop();
	};
	
	/**
	 * Automatically called when page has loaded.
	 */
	$timeout(function () {
		$scope.windowWidth = $window.innerWidth * 0.8;
		$scope.windowHeight = $window.innerHeight * 0.8;
		sim.init();
	});
});