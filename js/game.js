'use strict';
var Breakout = new function() {
	var self             = this;
	this.stage           = 0;
	this.board           = null;
	this.balls           = [];
	this.blocks          = [];
	this.paused          = false;
	this.ctx             = canvas.getContext("2d");
	this.lastRender      = Date.now();
	this.BLOCKS_PER_ROW  = 10;
	this.BLOCKS_PER_COL  = 15;
	this.BLOCK_MARGIN    = 5;
	this.BALL_SIZE       = 20;
	this.BLOCK_WIDTH     = (canvas.width - (self.BLOCKS_PER_ROW + 1) * self.BLOCK_MARGIN) / self.BLOCKS_PER_ROW;
	this.BLOCK_HEIGHT    = (canvas.height - (self.BLOCKS_PER_COL + 1) * self.BLOCK_MARGIN) / self.BLOCKS_PER_COL;
	this.quad            = new QuadNode(0, new Rectangle(0, 0, canvas.width, canvas.height));

	/**
	 * Init
	 */
	this.init = function() {
		SoundManager.init("sound/", ["background", "explosion", "gameover", "success", "blip", "blocked"]);

		self.positionPlayground();
		self.addEventHandlers();
	}

	/**
	 * Center playground
	 */
	this.positionPlayground = function() {
		canvas.style.top = (window.innerHeight - canvas.height) / 2 + 20 + "px";
		canvas.style.left = (window.innerWidth - canvas.width) / 2 + "px";
		document.getElementById("playground-overlay").style.top = (window.innerHeight - canvas.height) / 2 + 20 + "px";
		document.getElementById("playground-overlay").style.left = (window.innerWidth - canvas.width) / 2 + "px";
	}

	/**
	 * Add event handlers
	 */
	this.addEventHandlers = function() {
		document.getElementById("play").addEventListener('click', function() {
			document.getElementById("site-overlay").className = document.getElementById("site-overlay").className + " hidden";
			self.play();
		});

		document.onmousedown = function(e) {
			for (let ball of self.balls) {
				if (ball.stickPos) {
					ball.unstick();
				}
			}
		}

		document.onmousemove = function(e) {
			if (!self.board) {
				return;
			}

			self.board.x = e.pageX - parseInt(canvas.style.left) - self.board.width / 2;
			if (self.board.x < 0) {
				self.board.x = 0;
			}
			else if (self.board.x > canvas.width - self.board.width) {
				self.board.x = canvas.width - self.board.width;
			}

			for (let ball of self.balls) {
				if (ball.stickPos) {
					ball.x = self.board.x + ball.stickPos;
				}
			}
		}
	}

	/**
	 * Play
	 */
	this.play = function() {
		SoundManager.play("background", true);
		self.board = new Board((canvas.width - 250) / 2, canvas.height - 50);
		self.stage = 0;
		self.resetBoard();
		self.nextStage();
	}

	/**
	 * Load stage
	 * @param {int} stage
	 */
	this.loadStage = function(stage) {
		document.getElementById("playground-overlay").className = "";
		document.getElementById("playground-overlay").innerHTML = "Loading...";

		let map = stages[self.stage - 1];
		for (let i = 0; i < map.length; i++) {
			let marginY = (map[i][1] + 1) * self.BLOCK_MARGIN;
			let marginX = (map[i][0] + 1) * self.BLOCK_MARGIN;
			let block = new Block(map[i][0] * self.BLOCK_WIDTH + marginX, map[i][1] * self.BLOCK_HEIGHT + marginY, self.BLOCK_WIDTH, self.BLOCK_HEIGHT, map[i][2], map[i][3]);
			self.blocks.push(block);
		}

		self.resetBoard();

		document.getElementById("playground-overlay").innerHTML = "Stage " + self.stage;
		document.getElementById("stage").innerHTML = self.stage;

		setTimeout(function() {
			document.getElementById("playground-overlay").className = "hidden";
			self.paused = false;
			self.animate();
		}, 500);
	}

	/**
	 * Initialize loading of next stage
	 */
	this.nextStage = function() {
		self.paused = true;
		self.stage++;

		if (self.stage - 1 >= stages.length) {
			self.win();
			return;
		}

		// Update UI
		self.updateLives();
		document.getElementById("playground-overlay").className = "";
		document.getElementById("playground-overlay").innerHTML = (self.stage === 1) ? "Let's Play!" : "Victory!";

		setTimeout(function() {
			self.loadStage(self.stage);
		}, 500);
	}

	/**
	 * Win
	 */
	this.win = function() {
		SoundManager.stop("background");
		SoundManager.play("success");
		document.getElementById("playground-overlay").className = "";
		document.getElementById("playground-overlay").innerHTML = "You Won!";
	}

	/**
	 * Lose
	 */
	this.lose = function() {
		SoundManager.play("gameover");

		if (self.board.lives > 1) {
			self.board.lives--;
			self.updateLives();
			self.resetBoard();
		}
		else {
			self.paused = true;
			document.getElementById("playground-overlay").className = "";
			document.getElementById("playground-overlay").innerHTML = "Game Over.";
			document.getElementById("site-overlay").className = "center";
		}
	}

	/**
	 * Update lives
	 */
	this.updateLives = function() {
		document.getElementById("lives").innerHTML = '&#9829; '.repeat(self.board.lives) + '&#9825; '.repeat(self.board.maxLives - self.board.lives);
	}

	/**
	 * Reset board
	 */
	this.resetBoard = function() {
		self.board.x = (canvas.width - self.board.width) / 2;
		let ball = new Ball(self.board.x + self.board.width / 2, self.board.y - 30, self.BALL_SIZE, self.board.width / 2);
		self.balls = [ball];
	}

	/**
	 * Animation loop
	 */
	this.animate = function() {
		if (!self.paused) {
			const delta = (Date.now() - self.lastRender) / 1000;
			self.update(delta);
			self.lastRender = Date.now();
			self.draw();

			// Request a new animation frame using Paul Irish's shim
			window.requestAnimationFrame(self.animate);
		}
	}

	/**
	 * Update loop
	 * @param {int} dt
	 */
	this.update = function(dt) {
		this.quad.clear();

		// Build QuadTree
		for (let i = 0; i < self.blocks.length; i++) {
			let block = self.blocks[i];
			if (block.power < 0) {
				self.blocks.splice(i, 1);
			}
			else {
				this.quad.insert(self.blocks[i]);
			}
		}

		if (self.blocks.length == 0) {
			self.nextStage();
			return;
		}

		// Check ball collisions<
		for (let i = 0; i < self.balls.length; i++) {
			let ball = self.balls[i];
			let possColl = this.quad.retrieve(ball);

			// Ball vs. Canvas
			if (!ball.bound(canvas.width, canvas.height)) {
				self.lose();
			}

			// Ball vs. Blocks
			for (let j = 0; j < possColl.length; j++) {
				let block = possColl[j];
				const collision = Collision.collide(ball, block);

				if (collision) {
					ball.collide(collision, block);
					self.board.addScore(block.getHit());
				}
			}

			// Ball vs. Board
			if (Collision.collide(ball, self.board)) {
				ball.collideWithBoard(self.board);
			}

			// Update position
			ball.update();
		}
	}

	/**
	 * Draw
	 */
	this.draw = function() {
		self.ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Stage
		for (let block of self.blocks) {
			block.draw(self.ctx);
		}

		// Balls
		for (let ball of self.balls) {
			ball.draw(self.ctx);
		}

		// Board
		self.board.draw(self.ctx);

		// Score
		document.getElementById("scorediv").innerHTML = self.board.getScore();
	}
}

window.onload = function() {
	Breakout.init();
}
