class Camera {
	constructor() {
		this.position = [0.0, 0.0, 0.0];
		this.rotation = [0.0, 0.0, 0.0];

		this.projection = glMatrix.mat4.create();
	}
}