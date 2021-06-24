class FullscreenPointerLocker {
	constructor () {
		this.pointerLocked = false;
		this.lock();
	}

	lock() {
		canvas.requestFullscreen();
		canvas.requestPointerLock();
		if(!(document.pointerLockElement === canvas)) {
			this.pointerLocked = false;
		}
	}
	update() {
		if(!this.pointerLocked) {
			if(!(document.pointerLockElement === canvas)) {
				canvas.requestPointerLock();
			}
			else {
				this.pointerLocked = true;
			}
		}
	}
}