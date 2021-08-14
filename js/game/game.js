class Game {
	constructor() {
		this.renderer = new ezgfx.Renderer(); 
		this.renderer.depthTesting(true); 
		
		this.player = new MainPlayer();
	
		this.players = new Players();
	}

	update(deltaTime) {
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