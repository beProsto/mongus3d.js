// let playerRotationY = 0.0;

class Game {
	constructor() {
		this.renderer = new ezgfx.Renderer();
		this.renderer.depthTesting(true);

		this.player = new MainPlayer();

		this.players = new Players();
		// this.player.camera.rotationY = 0.0;
	}

	update(deltaTime) {
		this.player.update(deltaTime);
		// playerRotationY = this.player.camera.rotationY;

		this.renderer.viewport(0, 0, canvas.width, canvas.height, this.player.camera);
		this.renderer.clear([0.3, 1.0, 0.4, 1.0]);

		this.players.renderAllPlayersExceptTheMainPlayer(this.renderer, this.player.camera);
	}
}

// setInterval(() => {
// 	console.log(JSON.stringify(globals.Updates));
// 	console.log(playerRotationY);
// }, 300);


// this is how looping through a list of object's values 
// to get rid of them looks like

// for (const [key, value] of Object.entries(objects)) {
// 	value.free();
// }