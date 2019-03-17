class Block extends Rectangle {
	constructor(x, y, width, height, power, color) {
		super(x, y, width, height);

		this.power = power;
		this.color = color;
		this.cornerRadius = 10;
	}

	getColor() {
		if (this.power == 0) {
			return "#" + this.color
		}
		else if (this.power == 1) {
			return '#bec2cb';
		}
		else {
			return '#ffd700';
		}
	}

	getHit() {
		console.log("get hit");
		this.power--;

		if (this.power < 0) {
			SoundManager.play("explosion");
			return 100;
		}
		else {
			SoundManager.play("blip");
			return 50;
		}
	}

	draw(ctx) {
		if (this.power < 0) {
			return;
		}

		ctx.lineJoin = "round";
		ctx.lineWidth = this.cornerRadius;
		const color = this.getColor();
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.strokeRect(this.x + (this.cornerRadius / 2), this.y + (this.cornerRadius / 2), this.width - this.cornerRadius, this.height - this.cornerRadius);
		ctx.fillRect(this.x + (this.cornerRadius / 2), this.y + (this.cornerRadius / 2), this.width - this.cornerRadius, this.height - this.cornerRadius);
	}
}
