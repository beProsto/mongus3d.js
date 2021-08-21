class Game {
	constructor() {
		this.renderer = new ezgfx.Renderer();
		this.renderer.depthTesting(true);

		this.player = new MainPlayer();

		this.players = new Players();

		this.boxMesh = new ezgfx.Mesh();
		this.boxMesh.loadFromOBJ("/obj/box.obj");

		this.boxMat = new ezgfx.Material(null, null, "vec4 shader() { return texture(u_TexID[0], v_TexCoord); }");
		this.boxMat.setModel(ezgfxGlobals.identityMatrix);
		
		this.boxTexture = new ezgfx.Texture();
		this.boxTexture.loadFromFile("/img/box.png");
		
		this.boxMat.setTexture(this.boxTexture);
	}

	update(deltaTime) {
		this.player.update(deltaTime);

		this.renderer.viewport(0, 0, canvas.width, canvas.height, this.player.camera);
		this.renderer.clear([0.4, 0.3, 1.0, 1.0]);

		this.player.camera.applyMatrices(this.boxMat);
		this.renderer.draw(this.boxMesh, this.boxMat);
		this.players.renderAllPlayersExceptTheMainPlayer(this.renderer, this.player.camera);
	}
}

// this is how looping through a list of object's values 
// to get rid of them looks like

// for (const [key, value] of Object.entries(objects)) {
// 	value.free();
// }