class MainPlayer {
	constructor() {
		this.lastPosX = 0.0;
		this.lastPosZ = 0.0;
		this.lastRotY = 0.0;

		this.camera = new Camera();
		this.camera.positionY = 4.3;
	}

	update(deltaTime) {
		this.input(deltaTime);
		this.communication();
	}

	input(deltaTime) {
		// saving the last position and rotation so we can see if we have to notice the server about the changes later
		this.lastPosX = this.camera.positionX;
		this.lastPosZ = this.camera.positionZ;
		this.lastRotY = this.camera.rotationY;

		// mouse rotation
		this.camera.rotationY -= mouse.velocity[0] * deltaTime;
		this.camera.rotationX -= mouse.velocity[1] * deltaTime;
		
		// limiting the camera's x rotation to be from -90 to 90 degrees
		this.camera.rotationX = Math.min(Math.max(this.camera.rotationX, -1.570795), 1.570795);

		// wrapping the camera's y rotation to not exceed 360 degrees nor to go below -360 (had problems with numbers going out of server's operational scope)
		if(this.camera.rotationY < -6.28318530718 || this.camera.rotationY > 6.28318530718) this.camera.rotationY %= 6.28318530718;

		// caching important calculations
		const sinRotY = Math.sin(this.camera.rotationY);
		const cosRotY = Math.cos(this.camera.rotationY);

		// checking for input - these values will range from 1 to -1, 1 means on, 0 off, -1 means the opposite
		const backwardInput = pressedKeys["KeyS"] | 0 - pressedKeys["KeyW"] | 0;
		const rightInput = pressedKeys["KeyD"] | 0 - pressedKeys["KeyA"] | 0;

		// calculating the proper direction
		const dirX = backwardInput * sinRotY + rightInput * cosRotY;
		const dirZ = backwardInput * cosRotY + rightInput * -sinRotY;

		// add the direction to the position - move the camera (player)
		this.camera.positionX += dirX * deltaTime * 10.0;
		this.camera.positionZ += dirZ * deltaTime * 10.0;
	}

	communication() {
		if(this.camera.positionX != this.lastPosX) {
			globals.TCPChan.send("X" + this.camera.positionX);
		}
		if(this.camera.positionZ != this.lastPosZ) {
			globals.TCPChan.send("Z" + this.camera.positionZ);
		}
		if(this.camera.rotationY != this.lastRotY) {
			globals.TCPChan.send("YR" + this.camera.rotationY);
		}
	}
}