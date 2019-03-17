function QuadNode(pLevel, pBounds) {
	this.level = pLevel;
	this.bounds = pBounds;

	this.objects = [];
	this.nodes = [];
	this.MAX_OBJECTS = 5;
	this.MAX_LEVELS = 7;

	this.clear = function() {
		this.objects.length = 0;

		for (let i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i] != null) {
				this.nodes[i].clear();
				this.nodes[i] = null;
			}
		}
	};

	this.splitnode = function() {
		const subWidth = this.bounds.width / 2;
		const subHeight = this.bounds.height / 2;

		const x = this.bounds.x;
		const y = this.bounds.y;

		// Top-Right
		this.nodes[0] = new QuadNode(this.level + 1, new Rectangle(x + subWidth, y, subWidth, subHeight));
		// Top.Left
		this.nodes[1] = new QuadNode(this.level + 1, new Rectangle(x, y, subWidth, subHeight));
		// Bottom-Left
		this.nodes[2] = new QuadNode(this.level + 1, new Rectangle(x, y + subHeight, subWidth, subHeight));
		// Bottom-Right
		this.nodes[3] = new QuadNode(this.level + 1, new Rectangle(x + subWidth, y + subHeight, subWidth, subHeight));
	};

	this.getIndex = function(obj) {
		// Index -1 means obj does not fit in a child-node and remains in the parent
		let index = -1;
		const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
		const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

		// Object fits completely in top quadrants
		const topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
		// Object fits completely in bottom quadrants
		const bottomQuadrant = (obj.y > horizontalMidpoint);

		// Object fits completely in left quadrants
		if (obj.x < verticalMidpoint && obj.x + obj.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			}
			else if (bottomQuadrant) {
				index = 2;
			}
		}
		// Object fits completely in right quadrants
		else if (obj.x > verticalMidpoint) {
			if (topQuadrant) {
				index = 0;
			}
			else if (bottomQuadrant) {
				index = 3;
			}
		}

		return index;
	};

	this.getIndices = function(obj) {
		let indices = [];
		const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
		const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

		if (obj.x <= verticalMidpoint) {
			if (obj.y <= horizontalMidpoint) {
				indices.push(1);
			}
			if (obj.y + obj.height > horizontalMidpoint) {
				indices.push(2);
			}
		}
		if (obj.x + obj.width > verticalMidpoint) {
			if (obj.y <= horizontalMidpoint) {
				indices.push(0);
			}
			if (obj.y + obj.height > horizontalMidpoint) {
				indices.push(3);
			}
		}

		return indices;
	}

	this.insert = function(obj) {
		if (this.nodes[0] != null) {
			const index = this.getIndex(obj);

			if (index != -1) {
				// obj fits into a quadrant, so insert it there
				this.nodes[index].insert(obj);
				return;
			}
		}

		// There are no child nodes or obj does not fit in a quadrant
		this.objects.push(obj);

		// If node capacity is exceeded and level < max depth, split node
		if (this.objects.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
			if (this.nodes[0] == null) {
				this.splitnode();
			}

			// Distribute all objects of this node into the new sub-nodes if they fit
			// otherwise skip and keep them in parent-node
			let i = 0;
			while (i < this.objects.length) {
				const index = this.getIndex(this.objects[i]);
				if (index != -1) {
					let theSplice = this.objects.splice(i, 1);
					this.nodes[index].insert(theSplice[0]);
				}
				else {
					i++;
				}
			}
		}
	};

	/* retrieve only returns elements that are in or above the last
	 * node they completely fit in
	 * retrieve2 also returns elements in further sub-nodes
	 * This is not always necessary as the element in the deeper
	 * sub-node will also check against collision and find
	 * the elements in all the parent-nodes
	 * Thus, retrieve (1) is more efficient
	 */

	this.retrieve = function(obj, includeChildren = true) {
		let returnObjects = [];
		if (this.nodes[0] != null) {
			let indices = this.getIndices(obj);
			if (includeChildren) {
				for (let i = 0; i < indices.length; i++) {
					returnObjects = returnObjects.concat(this.nodes[indices[i]].retrieve(obj, includeChildren));
				}
			}
			else if (indices.length == 1) {
				returnObjects = this.nodes[indices[0]].retrieve(obj, includeChildren);
			}
		}

		return returnObjects.concat(this.objects);
	}

	this.getAllNodes = function(nodes) {
		if (this.nodes[0] != null) {
			for (let i = 0; i < this.nodes.length; i++) {
				this.nodes[i].getAllNodes(nodes);
			}
		}
		nodes.push(this);
		return nodes;
	};
}
