// let playerRotationY = 0.0;

class Game {
	constructor() {
		this.renderer = new ezgfx.Renderer();
		this.renderer.depthTesting(true);

		this.player = new MainPlayer();

		this.players = new Players();
		// this.player.camera.rotationY = 0.0;

		this.boxMesh = new ezgfx.Mesh();
		this.boxMesh.loadFromOBJ("/obj/box.obj");
		this.boxMat = new ezgfx.Material(null, null, "vec4 shader() { return texture(u_TexID[0], v_TexCoord); }")
		this.boxTexture = new ezgfx.Texture();
		this.boxTexture.loadFromFile("/img/box.png");
		this.boxMat.setTexture(this.boxTexture);
		this.boxMat.setModel(ezgfxGlobals.identityMatrix);
	}

	update(deltaTime) {
		this.player.update(deltaTime);
		// playerRotationY = this.player.camera.rotationY;

		this.renderer.viewport(0, 0, canvas.width, canvas.height, this.player.camera);
		this.renderer.clear([0.3, 1.0, 0.4, 1.0]);

		this.player.camera.applyMatrices(this.boxMat);
		this.renderer.draw(this.boxMesh, this.boxMat);
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