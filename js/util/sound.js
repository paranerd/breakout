var SoundManager = new function() {
	var self = this;

	this.init = function(audioPath, names) {
		this.sounds = {};

		for (let name of names) {
			let sound = new Audio();
			sound.preload = "auto";
			sound.autobuffer = true;
			sound.src = audioPath + name + ".ogg";
			sound.name = name;
			this.sounds[name] = {"sound": sound, "pos": 0};

			sound.load();
		}
	}

	this.get = function(name) {
		return this.sounds[name];
	}

	this.play = function(name, loop = false) {
		let sound = this.get(name);

		if (!sound) {
			return;
		}

		// If sound loaded yet, try again
		if (sound.sound.readyState != 4 && !sound.sound.listener) {
			setTimeout(function() {
				self.play(name, loop);
			}, 100);
			return;
		}

		if (loop) {
			sound.sound.addEventListener('ended', function() {
				this.currentTime = 0;
				this.play(name, loop);
			}, false);
		}

		sound.sound.pause();
		sound.sound.currentTime = sound.pos;
		sound.sound.play();
	}

	this.pause = function(name) {
		let sound = this.get(name);
		if (sound) {
			sound.pos = sound.currentTime;
			sound.sound.pause();
		}
	}

	this.stop = function(name) {
		let sound = this.get(name);
		if (sound) {
			sound.sound.pause();
			sound.sound.currentTime = 0;
		}
	}
}
