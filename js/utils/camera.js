class Camera {
	constructor() {
		this._position = [0.0, 0.0, 0.0];
		this._rotation = [0.0, 0.0, 0.0];
		this._view = glMatrix.mat4.create();

		this._fov = 1.570795; // Half PI
		this._aspect = 1.777778; // 16 / 9
		this._projection = glMatrix.mat4.create();
		
		this.uptodate = false;
		this.uptodate_view = false;
		this.uptodate_proj = false;
	}

	updateView() {
		if(!this.uptodate_view) {
			this.uptodate_view = true;

			transformTRS(this._view, ezgfxGlobals.identityMatrix, this._position, this._rotation);
			glMatrix.mat4.invert(this._view, this._view);
		}
	}
	updateProj() {
		if(!this.uptodate_proj) {
			this.uptodate_proj = true;

			glMatrix.mat4.perspective(this._projection, this._fov, this._aspect, 0.1, 500.0);
		}
	}

	update() {
		if(!this.uptodate) {
			this.uptodate = true;

			this.updateView();
			this.updateProj();
		}
	}

	applyMatrices(material) {
		this.update();
		material.setProjection(this._projection);
		material.setView(this._view);
	}

	set fov(a) {
		if(this._fov != a){
			this.uptodate = false;
			this.uptodate_proj = false;
			
			this._fov = a;
		}
	}
	get fov() {
		return this._fov;
	}
	
	set aspect(a) {
		if(this._aspect != a){
			this.uptodate = false;
			this.uptodate_proj = false;
			
			this._aspect = a;
		}
	}
	get aspect() {
		return this._aspect;
	}

	
	set position(a) {
		if(this._position != a){
			this.uptodate = false;
			this.uptodate_view = false;
			
			this._position = a;
		}
	}
	set positionX(a) {
		if(this._position[0] != a){
			this.uptodate = false;
			this.uptodate_view = false;
			
			this._position[0] = a;
		}
	}
	set positionY(a) {
		if(this._position[1] != a){
			this.uptodate = false;
			this.uptodate_view = false;
			
			this._position[1] = a;
		}
	}
	set positionZ(a) {
		if(this._position[2] != a){
			this.uptodate = false;
			this.uptodate_view = false;
			
			this._position[2] = a;
		}
	}
	get position() {
		return this._position;
	}
	get positionX() {
		return this._position[0];
	}
	get positionY() {
		return this._position[1];
	}
	get positionZ() {
		return this._position[2];
	}

	
	set rotation(a) {
		if(this._rotation != a){
			this.uptodate = false;
			this.uptodate_view = false;
			
			this._rotation = a;
		}
	}
	set rotationX(a) {
		if(this._rotation[0] != a){
			this.uptodate = false;
			this.uptodate_view = false;
			
			this._rotation[0] = a;
		}
	}
	set rotationY(a) {
		if(this._rotation[1] != a){
			this.uptodate = false;
			this.uptodate_view = false;
			
			this._rotation[1] = a;
		}
	}
	set rotationZ(a) {
		if(this._rotation[2] != a){
			this.uptodate = false;
			this.uptodate_view = false;
			
			this._rotation[2] = a;
		}
	}
	get rotation() {
		return this._rotation;
	}
	get rotationX() {
		return this._rotation[0];
	}
	get rotationY() {
		return this._rotation[1];
	}
	get rotationZ() {
		return this._rotation[2];
	}

	get view() {
		return this._view;
	}
} 