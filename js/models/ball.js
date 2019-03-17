class Ball extends Rectangle {
	constructor(x, y, size, relX) {
		super(x, y, size, size, relX);

		this.speed = {x: 0, y: 0};
		this.backup = {x: 0, y: -8};
		this.stickPos = relX;
		this.color = "grey";
		this.collision;
	}

	stick(relX) {
		this.backup.x = this.speed.x;
		this.backup.y = this.speed.y;
		this.speed.x = 0;
		this.speed.y = 0;
		this.stickPos = relX;
	}

	unstick() {
		this.speed.x = this.backup.x;
		this.speed.y = this.backup.y;
		this.stickPos = null;
	}

	bound(boundWidth, boundHeight) {
		if (this.x + this.width > boundWidth) {
			this.speed.x *= -1;
			this.x = boundWidth - this.width;
			SoundManager.play("blip");
		}
		else if (this.x < 0) {
			this.speed.x *= -1;
			this.x = 0;
			SoundManager.play("blip");
		}
		if (this.y + this.height >= boundHeight) {
			return false;
		}
		else if (this.y < 0) {
			this.speed.y *= -1;
			this.y = 0;
			SoundManager.play("blip");
		}

		return true;
	}

	update() {
		if (this.collision) {
			if (this.collision.top || this.collision.bottom) {
				this.speed.y *= -1;
			}
			if (this.collision.left || this.collision.right) {
				this.speed.x *= -1;
			}

			this.collision = null;
		}

		this.x += this.speed.x;
		this.y += this.speed.y;
	}

	collide(collision, block) {
		this.collision = collision;
		if (collision.bottom) {
			this.y = block.y - this.height;
		}
		else if (collision.top) {
			this.y = block.y + block.height;
		}
		if (collision.right) {
			this.x = block.x - this.width;
		}
		else if (collision.left) {
			this.x = block.x + block.width;
		}
	}

	collideWithBoard(board) {
		const relIntersect = (board.x + (board.width / 2)) - (this.x + this.width / 2);
		const normalized = (relIntersect / (board.width / 2));
		this.speed.x = normalized * -2;
		this.speed.y *= -1;
		this.y = board.y - this.height - 1;

		if (board.sticky && !this.stickPos) {
			this.stick(this.x - board.x);
		}
		else {
			SoundManager.play("blip");
		}
	}

	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, 2 * Math.PI);
		ctx.fill();
	}
}
