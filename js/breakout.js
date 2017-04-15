var colors			= ["lightgrey", "darkgrey", "grey"]
	currLevel		= 1,
	balls			= [],
	blocks			= [],
	run				= true,
	ctx				= canvas.getContext("2d"),
	lastRender		= Date.now(),

	BALL_SIZE		= 20;

var levels = {
	1: [[100, 100, 0]],
	2: [[60, 60, 0], [220, 60, 1], [380, 60, 0], [540, 60, 1], [700, 60, 0],
		[60, 100, 1], [220, 100, 0], [380, 100, 1], [540, 100, 0], [700, 100, 1],
		[60, 140, 0], [220, 140, 1], [380, 140, 0], [540, 140, 1], [700, 140, 0]],
	3: [[100, 100, 2], [255, 100, 0]]
}

var board = new function() {
	this.x = (canvas.width - 250) / 2;
	this.y = canvas.height - 50;
	this.height = 20;
	this.width = 250;
	this.sticky = false;
	this.maxlifes = 5;
	this.lifes = this.maxlifes;
	this.score = 0;
}

var Ball = function(x, y, size) {
	this.x = x;
	this.y = y;
	this.width = size;
	this.height = size;
	this.speed = {x: 0, y: 0};
	this.backup = {x: 0, y: -8};
	this.sticks = board.width / 2;
}

var Block = function(x, y, level) {
	this.x = x;
	this.y = y;
	this.width = 150;
	this.height = 30;
	this.level = level;
}

function init(stage) {
	overlay.className = "";
	overlay.innerHTML = "Loading...";

	var l = levels[stage];
	for(var i = 0; i < l.length; i++) {
		var block = new Block(l[i][0], l[i][1], l[i][2]);
		blocks.push(block);
	}

	reset();
	overlay.innerHTML = "Level " + stage;
	level.innerHTML = stage;

	setTimeout(function() {
		overlay.className = "hidden";
		animate();
	}, 1000);
}

function reset() {
	board.x = (canvas.width - board.width) / 2;
	balls = [];
	balls.push(new Ball(board.x + board.width / 2, board.y - 30, BALL_SIZE));
}

window.onload = function() {
	// Center playground
	canvas.style.top = (window.innerHeight - canvas.height) / 2 + 20 + "px";
	canvas.style.left = (window.innerWidth - canvas.width) / 2 + "px";
	overlay.style.top = (window.innerHeight - canvas.height) / 2 + 20 + "px";
	overlay.style.left = (window.innerWidth - canvas.width) / 2 + "px";

	init(currLevel);
}

document.onmousedown = function(e) {
	for(var i = 0; i < balls.length; i++) {
		if(balls[i].sticks) {
			balls[i].speed.x = balls[i].backup.x;
			balls[i].speed.y = balls[i].backup.y;
			balls[i].sticks = null;
		}
	}
}

document.onmousemove = function(e) {
	board.x = e.pageX - parseInt(canvas.style.left) - board.width / 2;
	if(board.x < 0) {
		board.x = 0;
	}
	else if(board.x > canvas.width - board.width) {
		board.x = canvas.width - board.width;
	}

	for(var i = 0; i < balls.length; i++) {
		if(balls[i].sticks) {
			balls[i].x = board.x + balls[i].sticks;
		}
	}
}

function collide(ent1, ent2) {
	if(ent1.x + ent1.width >= ent2.x && ent1.x <= ent2.x + ent2.width &&
		ent1.y + ent1.height >= ent2.y && ent1.y <= ent2.y + ent2.height)
	{
		var bottom_diff = ent2.y + ent2.height - ent1.y;
		var top_diff = ent1.y + ent1.height - ent2.y;
		var left_diff = ent1.x + ent1.width - ent2.x;
		var right_diff = ent2.x + ent2.width - ent1.x;

		var coll = {bottom: false, right: false, left: false, top: false};

		coll.bottom = top_diff < bottom_diff && top_diff < left_diff && top_diff < right_diff;
		coll.right = left_diff < right_diff && left_diff < top_diff && left_diff < bottom_diff;
		coll.left = right_diff < left_diff && right_diff < top_diff && right_diff < bottom_diff;
		coll.top = bottom_diff < top_diff && bottom_diff < left_diff && bottom_diff < right_diff;

		return coll;
	}
	return false;
}

function empty(id) {
	var node = document.getElementById(id);

	while (node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
}

function gameOver() {
	run = false;
	empty("lifes");

	for(var i = 1; i <= board.maxlifes; i++) {
		var heart = (board.lifes > i) ? '&#9829' : '&#9825';
		lifes.innerHTML = lifes.innerHTML + " " + heart;
	}

	if(board.lifes > 1) {
		board.lifes--;
		setTimeout(function() {
			reset();
			run = true;
		}, 1000);
	}
	else {
		overlay.className = "";
		overlay.innerHTML = "Game Over.";
	}
}

// GAME LOOP
function animate() {
	var delta = (Date.now() - lastRender) / 1000;
	update(delta);
	lastRender = Date.now();
	draw();

	if(run && board.lifes > 0 && blocks.length > 0) {
		// Request a new animation frame using Paul Irish's shim
		window.requestAnimFrame(animate);
	}
	else if(run && board.lifes > 0) {
		overlay.className = "";
		overlay.innerHTML = "Victory!";
		if(currLevel < Object.keys(levels).length) {
			setTimeout(function() {
				currLevel++;
				overlay.innerHTML = "Level " + currLevel;
				init(currLevel);
			}, 2000);
		}
	}
};

var update = function() {
	for(var i = 0; i < balls.length; i++) {
		// Ball vs. Canvas
		if(balls[i].x + balls[i].width > canvas.width) {
			balls[i].speed.x *= -1;
			balls[i].x = canvas.width - balls[i].width;
		}
		if(balls[i].x < 0) {
			balls[i].speed.x *= -1;
			balls[i].x = 0;
		}
		if(balls[i].y + balls[i].height >= canvas.height) {
			gameOver();
		}
		if(balls[i].y < 0) {
			balls[i].speed.y *= -1;
			balls[i].y = 0;
		}

		// Ball vs. Blocks
		for(var j = 0; j < blocks.length; j++) {
			var collision = collide(balls[i], blocks[j]);

			if(collision) {
				if(collision.bottom) {
					balls[i].y = blocks[j].y - balls[i].height;
					balls[i].speed.y *= -1;
				}
				if(collision.top) {
					balls[i].y = blocks[j].y + blocks[j].height;
					balls[i].speed.y *= -1;
				}
				if(collision.right || collision.left) {
					balls[i].x = blocks[j].x - balls[i].width;
					balls[i].speed.x *= -1;
				}
				if(collision.left) {
					balls[i].x = blocks[j].x + blocks[j].width;
					balls[i].speed.x *= -1;
				}

				if(blocks[j].level > 0) {
					blocks[j].level--;
				}
				else {
					blocks.splice(j, 1);
				}
				board.score += 100;
			}
		}

		// Ball vs. Board
		if(	balls[i].x + balls[i].width >= board.x && balls[i].x <= board.x + board.width &&
			balls[i].y + balls[i].height >= board.y && balls[i].y <= board.y + board.height)
		{
			var relIntersect = (board.x + (board.width / 2)) - (balls[i].x + balls[i].width / 2);
			var normalized = (relIntersect / (board.width / 2));
			balls[i].speed.x = normalized * -2;
			balls[i].speed.y *= -1;
			balls[i].y = board.y - balls[i].height - 1;

			if(board.sticky && !balls[i].sticks) {
				balls[i].backup.x = balls[i].speed.x;
				balls[i].backup.y = balls[i].speed.y;
				balls[i].speed.x = 0;
				balls[i].speed.y = 0;
				balls[i].sticks = balls[i].x - board.x;
			}
		}

		// Update position
		balls[i].x += balls[i].speed.x;
		balls[i].y += balls[i].speed.y;
	}
}

var draw = function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var cornerRadius = 10;
	ctx.lineJoin = "round";
	ctx.lineWidth = cornerRadius;

	// Level
	for(var i = 0; i < blocks.length; i++) {
		ctx.strokeStyle = colors[blocks[i].level];
		ctx.fillStyle = colors[blocks[i].level];
		ctx.strokeRect(blocks[i].x + (cornerRadius / 2), blocks[i].y + (cornerRadius / 2), blocks[i].width - cornerRadius, blocks[i].height - cornerRadius);
		ctx.fillRect(blocks[i].x + (cornerRadius / 2), blocks[i].y + (cornerRadius / 2), blocks[i].width - cornerRadius, blocks[i].height - cornerRadius);
	}

	// Balls
	for(var i = 0; i < balls.length; i++) {
		ctx.fillStyle = "grey";
		ctx.beginPath();
		ctx.arc(balls[i].x + balls[i].width / 2, balls[i].y + balls[i].height / 2, balls[i].width / 2, 0, 2 * Math.PI);
		ctx.fill();
	}

	// Board
	ctx.strokeStyle = "grey";
	ctx.strokeRect(board.x + (cornerRadius / 2), board.y + (cornerRadius / 2), board.width - cornerRadius, board.height - cornerRadius);
	ctx.fillRect(board.x + (cornerRadius / 2), board.y + (cornerRadius / 2), board.width - cornerRadius, board.height - cornerRadius);

	// Score
	scorediv.innerHTML = board.score;
}