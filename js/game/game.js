class Game {
	constructor() {
		this.renderer = new ezgfx.Renderer(); 
		this.renderer.depthTesting(true); 
		
		this.camera = new Camera();
		this.camera.position[1] = 4.3;
	
		this.players = new Players();
	}

	update(deltaTime) {
		this.camera.rotationY -= mouse.velocity[0] * deltaTime;
		this.camera.rotationX -= mouse.velocity[1] * deltaTime;

		if(this.camera.rotationX > 1.570795) this.camera.rotationX = 1.570795;
		if(this.camera.rotationX < -1.570795) this.camera.rotationX = -1.570795;

		const forwardX = -Math.sin(this.camera.rotationY);
		const forwardZ = -Math.cos(this.camera.rotationY);

		if(pressedKeys["KeyW"] || mouse.wheel > 0.0) {
			this.camera.positionX += forwardX * deltaTime * 10.0;
			this.camera.positionZ += forwardZ * deltaTime * 10.0;
		}
		if(pressedKeys["KeyS"] || mouse.wheel < 0.0) {
			this.camera.positionX -= forwardX * deltaTime * 10.0;
			this.camera.positionZ -= forwardZ * deltaTime * 10.0;
		}
		if(pressedKeys["KeyA"]) {
			this.camera.positionX += forwardZ * deltaTime * 10.0;
			this.camera.positionZ -= forwardX * deltaTime * 10.0;
		}
		if(pressedKeys["KeyD"]) {
			this.camera.positionX -= forwardZ * deltaTime * 10.0;
			this.camera.positionZ += forwardX * deltaTime * 10.0;
		}

		this.renderer.viewport(0, 0, canvas.width, canvas.height, this.camera);
		this.renderer.clear([0.3, 1.0, 0.4, 1.0]); 

		this.players.renderPlayer(this.renderer, this.camera);	
	}
}

	// this is how looping through a list of object's values 
	// to get rid of them looks like

	// for (const [key, value] of Object.entries(objects)) {
	// 	value.free();
	// }