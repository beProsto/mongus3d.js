function transformTRS(out, from, translation = [0.0, 0.0, 0.0], rotation = [0.0, 0.0, 0.0], scale = [1.0, 1.0, 1.0]) {
	glMatrix.mat4.translate(out, from, translation);
	glMatrix.mat4.rotate(out, out, rotation[2], [0.0, 0.0, 1.0]);
	glMatrix.mat4.rotate(out, out, rotation[1], [0.0, 1.0, 0.0]);
	glMatrix.mat4.rotate(out, out, rotation[0], [1.0, 0.0, 0.0]);
}