const playersListUrl = "/players";

class Players {
	constructor() {
		this.meshIdle = new ezgfx.Mesh();
		this.meshIdle.loadFromOBJ("/obj/amongus_idle.obj");
		this.meshEye = new ezgfx.Mesh();
		this.meshEye.loadFromOBJ("/obj/amongus_eyes.obj");
			
		this.materialBody = new ezgfx.Material();
		this.materialEye = new ezgfx.Material();

		this.materialBody.setColor([1.0, 0.3, 0.3, 1.0]);
		this.materialEye.setColor([0.3, 0.3, 1.0, 1.0]);

		this.players = [];
	}

	renderPlayer(r, c, posX = 0.0, posZ = 0.0, rotY = 0.0) {
		const mat = glMatrix.mat4.create();
		transformTRS(mat, mat, [posX, 0.0, posZ], [0.0, rotY, 0.0]);

		this.materialBody.setModel(mat);
		this.materialEye.setModel(mat);

		c.applyMatrices(this.materialBody);
		c.applyMatrices(this.materialEye);

		r.draw(this.meshIdle, this.materialBody); 
		r.draw(this.meshEye, this.materialEye); 
	}
}