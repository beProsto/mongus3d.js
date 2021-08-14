class Game {
	constructor() {
		this.renderer = new ezgfx.Renderer(); 
		this.renderer.depthTesting(true); 
		
		//this.camera = new Camera();
		this.player = new MainPlayer();
	
		this.players = new Players();
	}

	update(deltaTime) {
		// this.camera.rotationY -= mouse.velocity[0] * deltaTime;
		// this.camera.rotationX -= mouse.velocity[1] * deltaTime;
		
		// this.camera.rotationX = Math.min(Math.max(this.camera.rotationX, -1.570795), 1.570795);

		// const sinRotY = Math.sin(this.camera.rotationY);
		// const cosRotY = Math.cos(this.camera.rotationY);

		// const backwardInput = pressedKeys["KeyS"] | 0 - pressedKeys["KeyW"] | 0;
		// const rightInput = pressedKeys["KeyD"] | 0 - pressedKeys["KeyA"] | 0;

		// const velX = backwardInput * sinRotY + rightInput * cosRotY;
		// const velZ = backwardInput * cosRotY + rightInput * -sinRotY;

		// this.camera.positionX += velX * deltaTime * 10.0;
		// this.camera.positionZ += velZ * deltaTime * 10.0;

		this.player.update(deltaTime);

		this.renderer.viewport(0, 0, canvas.width, canvas.height, this.player.camera);
		this.renderer.clear([0.3, 1.0, 0.4, 1.0]); 

		this.players.renderAllPlayersExceptTheMainPlayer(this.renderer, this.player.camera);	
	}
}

	// this is how looping through a list of object's values 
	// to get rid of them looks like

	// for (const [key, value] of Object.entries(objects)) {
	// 	value.free();
	// }