class Board extends Rectangle {
	/**
	 * Constructor
	 * @param {int} x
	 * @param {int} y
	 */
	constructor(x, y) {
		super(x, y, 200, 20);

		this.sticky = false;
		this.maxLives = 3;
		this.lives = this.maxLives;
		this.score = 0;
		this.cornerRadius = 10;
	}

	/**
	 * Add score
	 * @param {int} amount
	 */
	addScore(amount) {
		this.score += amount;
	}

	/**
	 * Get score
	 * @return {int}
	 */
	getScore() {
		return this.score;
	}

	/**
	 * Draw
	 * @param {Context} ctx
	 */
	draw(ctx) {
		ctx.lineJoin = "round";
		ctx.lineWidth = this.cornerRadius;
		ctx.strokeStyle = "grey";
		ctx.strokeRect(this.x + (this.cornerRadius / 2), this.y + (this.cornerRadius / 2), this.width - this.cornerRadius, this.height - this.cornerRadius);
		ctx.fillRect(this.x + (this.cornerRadius / 2), this.y + (this.cornerRadius / 2), this.width - this.cornerRadius, this.height - this.cornerRadius);
	}
}
