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

	renderAllPlayersExceptTheMainPlayer(r, c) {
		for(let key in globals.Updates) {
			if(globals.Updates.hasOwnProperty(key) && key != globals.playerTag)  {
				//context.fillRect(globals.Updates[key][0], globals.Updates[key][1], 50, 50);
				this.renderPlayer(r, c, globals.Updates[key][0], globals.Updates[key][1], globals.Updates[key][2]);
			}
		}
	}
}