class Camera {
	constructor() {
		this.position = [0.0, 0.0, 0.0];
		this.rotation = [0.0, 0.0, 0.0];
		this.view = glMatrix.mat4.create();

		this.fov = 1.570795; // Half PI
		this.aspect = 1.777778; // 16 / 9
		this.projection = glMatrix.mat4.create();
		
		this.uptodate = false;
		this.uptodate_view = false;
		this.uptodate_proj = false;
	}

	updateView() {
		if(!this.uptodate_view) {
			this.uptodate_view = true;

			transformTRS(this.view, ezgfxGlobals.identityMatrix, this.position, this.rotation);
			glMatrix.mat4.invert(this.view);
		}

	}

	updateProj() {
		if(!this.uptodate_proj) {
			this.uptodate_proj = true;

			glMatrix.mat4.perspective(this.projection, this.fov, this.aspect, 0.1, 1000.0);
		}

	}

	update() {
		if(!this.uptodate) {
			this.uptodate = true;

			this.updateView();
			this.updateProj();
		}
	}
} 