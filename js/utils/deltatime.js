class Time {
	constructor() {
		this.lastTime = Date.now();
		this.deltaTime = 0.0;
	}

	update(now) {
		this.deltaTime = (now - this.lastTime) / 1000.0;
		this.lastTime = now;
	}

	get delta() {
		return this.deltaTime;
	}
}