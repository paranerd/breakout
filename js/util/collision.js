class Collision {
	/**
	 * General collision handler
	 * @param {obj} obj1
	 * @param {obj} obj2
	 */
	static collide(obj1, obj2) {
		if (obj1 instanceof Rectangle) {
			if (obj2 instanceof Rectangle) {
				return Collision.collideRect(obj1, obj2);
			}
		}
		else if (obj1 instanceof Circle) {
			if (obj2 instanceof Circle) {
				return Collision.collideCircle(obj1, obj2);
			}
		}
	}

	/**
	 * Check collisions between two rectangles
	 * @param {Rectangle} obj1
	 * @param {Rectangle} obj2
	 */
	static collideRect(obj1, obj2) {
		if (obj1.x + obj1.width >= obj2.x && obj1.x <= obj2.x + obj2.width &&
			obj1.y + obj1.height >= obj2.y && obj1.y <= obj2.y + obj2.height)
		{
			const bottom_diff = obj2.y + obj2.height - obj1.y;
			const top_diff = obj1.y + obj1.height - obj2.y;
			const left_diff = obj1.x + obj1.width - obj2.x;
			const right_diff = obj2.x + obj2.width - obj1.x;
			const min = Math.min(bottom_diff, top_diff, left_diff, right_diff);

			return {
				bottom: top_diff == min,
				right: left_diff == min,
				left: right_diff == min,
				top: bottom_diff == min
			}
		}
		return null;
	}

	/**
	 * Check collisions between two circles
	 * @param {Circle} obj1
	 * @param {Circle} obj2
	 */
	static collideCircle(obj1, obj2) {
		const dist = Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
		return (dist < obj1.size / 2 + obj2.size / 2);
	}
}
