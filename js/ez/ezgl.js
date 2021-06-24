let  gl = null; // a global variable, we will assign our WebGL/WebGL2 context to it

const ezgl = { // inside of this object there will be all the basic abstraction
	init: function() {
		gl = canvas.getContext("webgl2"); 
		gl.webgl2 = true;
		if(!gl) { 
			console.warn("Browser does not support WebGL2, running the game in WebGL mode.");
			gl = canvas.getContext("webgl"); 
			gl.webgl2 = false;
			if(!gl) {
				alert("Browser does not support WebGL.");
				return; 
			}
		}
	},
	VertexBufferWGL2: class { // both vertex buffer and vertex array, whereas the vertex array is here only to store the vertex layout
		constructor() {
			this.va = gl.createVertexArray();
			gl.bindVertexArray(this.va);

			this.vb = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);

			this.stride = 8;
			this.length = 0;
			this.vertices = 0;

			this.vertexLayout();
		}
		free() { // free functions - they just delete all the WebGL2 objects created with the object
			gl.deleteBuffer(this.vb);
			gl.deleteVertexArray(this.va);
		}

		vertexLayout() { // this function supplies the vertex layout - it says how many elements there are per vertex, and how much floats they take up. we will mostly use the [3, 2, 3] combination, because it's the one used by OBJ models			
			gl.bindVertexArray(this.va);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);

			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
			gl.enableVertexAttribArray(0);
			gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 32, 12);
			gl.enableVertexAttribArray(1);
			gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 32, 20);
			gl.enableVertexAttribArray(2);
		}
		vertexData(data) { // simply takes in a Float32Array and supplies it to the buffer
			this.length = data.length;

			gl.bindVertexArray(this.va);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);

			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

			this.vertices = this.length / this.stride;
		}
		draw() { // draws our mesh
			gl.bindVertexArray(this.va);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);

			gl.drawArrays(gl.TRIANGLES, 0, this.vertices);
		}
		
	},
	VertexBufferWGL: class { // vertex buffer with vertex array substituted
		constructor() {
			this.vb = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);

			this.stride = 8;
			this.length = 0;
			this.vertices = 0;
		}
		free() { // free functions - they just delete all the WebGL2 objects created with the object
			gl.deleteBuffer(this.vb);
		}

		vertexLayout() { // this function supplies the vertex layout - it says how many elements there are per vertex, and how much floats they take up. we will mostly use the [3, 2, 3] combination, because it's the one used by OBJ models
			gl.bindVertexArray(this.va);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);

			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
			gl.enableVertexAttribArray(0);
			gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 32, 12);
			gl.enableVertexAttribArray(1);
			gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 32, 20);
			gl.enableVertexAttribArray(2);
		}
		vertexData(data) { // simply takes in a Float32Array and supplies it to the buffer
			this.length = data.length;

			gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);

			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

			this.vertices = this.length / this.stride;
		}
		draw() { // draws our mesh
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
			
			this.vertexLayout();
			gl.drawArrays(gl.TRIANGLES, 0, this.vertices);
		}
		
	},
	SubShader: class { // known as shader in WebGL2, simply contains shader code and type
		constructor(type, str) {
			this.shader = gl.createShader(type);
			gl.shaderSource(this.shader, str);
			gl.compileShader(this.shader);
			
			const message = gl.getShaderInfoLog(this.shader);
			if(message.length > 0) {
				alert(message);
				throw message;
			}
		}
		free() {
			gl.deleteShader(this.shader);
		}
	},
	Shader: class { // known as a program in WebGL2, just joins and links shaders
		constructor() {
			this.program = gl.createProgram();
		}
		free() {
			gl.deleteProgram(this.program);
		}

		join(subshader) {
			gl.attachShader(this.program, subshader.shader);
			return this;
		}
		link() {
			gl.linkProgram(this.program);
			gl.useProgram(this.program);
			return this;
		}

		bind() {
			gl.useProgram(this.program);
			return this;
		}

		// these are used for setting uniforms in shaders
		set1i(name, val) { // mostly for texture IDs
			gl.uniform1i(gl.getUniformLocation(this.program, name), val);
			return this;
		}
		set1f(name, val) { // maybe will find some kind of a use
			gl.uniform1f(gl.getUniformLocation(this.program, name), val);
			return this;
		}
		set2f(name, x, y) { // maybe will find some kind of a use 
			gl.uniform2f(gl.getUniformLocation(this.program, name), x, y);
			return this;
		}
		set3f(name, x, y, z) { // maybe will find some kind of a use 
			gl.uniform3f(gl.getUniformLocation(this.program, name), x, y, z);
			return this;
		}
		set4f(name, x, y, z, w) { // maybe will find some kind of a use (most likely colors)
			gl.uniform4f(gl.getUniformLocation(this.program, name), x, y, z, w);
			return this;
		}
		set4x4f(name, mat) { // for matrices (projection, view, model)
			gl.uniformMatrix4fv(gl.getUniformLocation(this.program, name), false, mat);
			return this;
		}
	},
	Texture: class { // Just a simple texture, and it can be loaded from a file
		constructor() {
			this.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
		free() {
			gl.deleteTexture(this.texture);
		}

		fromFile(url, options = {wrap: gl.REPEAT, filter: gl.NEAREST}) {
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.filter);
			let that = this;
			const img = new Image();
			img.onload = function() {
				gl.bindTexture(gl.TEXTURE_2D, that.texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			};
			img.src = url;
		}
		fromData(data, options = {wrap: gl.REPEAT, filter: gl.NEAREST}) {
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data));
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.filter);
		}

		bind(slot = 0) {
			gl.activeTexture(gl.TEXTURE0 + slot);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
		}
	}
};