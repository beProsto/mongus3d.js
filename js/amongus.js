const nickCheckUrl = "/nicknamecheck";
let nick = "";

document.getElementById("play-button").onclick = function() {
	if(document.getElementById("nickInput").value) {
		nick = document.getElementById("nickInput").value;
		let xhr = new XMLHttpRequest();
		xhr.open("PUT", nickCheckUrl); 
		xhr.onload = function () {
			let txt = xhr.responseText;
			if (xhr.readyState == 4 && (xhr.status == "201" || xhr.status == "200")) {
				if(txt == "ErrNickFound") {
					alert("gracz z tym pseudonimem już dołączył");
				}
				else if(txt == "Posted") {
					beginGame();
				}
			} else {
				console.error(txt);
			}
		};
		xhr.send(nick);
	}
	else {
		alert("Widzisz ten textbox?");
	}
};

function transformTRS(out, from, translation = [0.0, 0.0, 0.0], rotation = [0.0, 0.0, 0.0], scale = [0.0, 0.0, 0.0]) {
	glMatrix.mat4.translate(out, from, translation);
	glMatrix.mat4.rotate(out, out, rotation[2], [0.0, 0.0, 1.0]);
	glMatrix.mat4.rotate(out, out, rotation[1], [0.0, 1.0, 0.0]);
	glMatrix.mat4.rotate(out, out, rotation[0], [1.0, 0.0, 0.0]);
}

function beginGame() {
	canvas = document.createElement("canvas"); 
	gl = canvas.getContext("webgl2"); 
	if(!gl) { 
		alert("This browser does not support WebGL 2."); 
		return; 
	}
	canvas.style = "position: absolute; width: 100%; height: 100%; left: 0; top: 0; right: 0; bottom: 0; margin: 0; z-index: -1;";
	document.body.appendChild(canvas); 
	
	window.onresize = function () { 
		canvas.width = canvas.clientWidth * window.devicePixelRatio;
		canvas.height = canvas.clientHeight * window.devicePixelRatio;
	};
	window.onresize();

	document.getElementById("main").innerHTML = "";

	const renderer = new ezgfx.Renderer(); 
	renderer.depthTesting(true); 
	renderer.clear([0.3, 1.0, 0.4, 1.0]); 

	const amogusIdle = new ezgfx.Mesh();
	amogusIdle.loadFromOBJ("/obj/amongus_idle.obj");
	const amogusEye = new ezgfx.Mesh();
	amogusEye.loadFromOBJ("/obj/amongus_eyes.obj");
	
	const material = new ezgfx.Material();

	const material2 = new ezgfx.Material();

	let projMat = glMatrix.mat4.create();
	glMatrix.mat4.perspective(projMat, 3.14159 / 2.0, canvas.width / canvas.height, 0.1, 1000.0);
	
	let transMat = glMatrix.mat4.create();
	let pos = [0.0, -2.5, -5.0];
	let rot = [0.0, 0.0, 0.0];
	glMatrix.mat4.translate(transMat, transMat, pos);

	console.log(projMat);
	console.log(transMat);

	const identityMatrix = new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	]);

	material.setProjection(projMat);
	material.setView(identityMatrix);
	material.setModel(transMat);
	material.setColor([1.0, 0.3, 0.3, 1.0]);

	material2.setProjection(projMat);
	material2.setView(identityMatrix);
	material2.setModel(transMat);
	material2.setColor([0.3, 0.3, 1.0, 1.0]);

	let lastMousePosition = [0.0, 0.0];
	lastMousePosition[0] = mouse.position[0];
	lastMousePosition[1] = mouse.position[1];

	let lastMousePositionSet = false;

	function onFrame() { 
		glMatrix.mat4.perspective(projMat, 90.0, canvas.width / canvas.height, 0.1, 1000.0);
		material.setProjection(projMat);
		material2.setProjection(projMat);

		if(pressedKeys["ArrowRight"]) {
			rot[1] -= 0.1;
		}
		if(pressedKeys["ArrowLeft"]) {
			rot[1] += 0.1;
		}
		if(pressedKeys["ArrowUp"]) {
			rot[0] -= 0.1;
		}
		if(pressedKeys["ArrowDown"]) {
			rot[0] += 0.1;
		}

		// if(mouse.pressedButtons[0]) {
		// 	if(lastMousePositionSet) {
		// 		rot[1] += (mouse.position[0] - lastMousePosition[0]) * 0.01;
		// 		rot[0] += (mouse.position[1] - lastMousePosition[1]) * 0.01;
		// 	}

		// 	lastMousePosition[0] = mouse.position[0];
		// 	lastMousePosition[1] = mouse.position[1];
		// 	lastMousePositionSet = true;
		// }
		// else {
		// 	lastMousePositionSet = false;
		// }
		if(mouse.pressedButtons[0]) {
			rot[1] += mouse.velocity[0] * 0.01;
			rot[0] += mouse.velocity[1] * 0.01;
		}

		glMatrix.mat4.translate(transMat, identityMatrix, [0.0, 2.5, 0.0]);
		transformTRS(transMat, transMat, pos, rot);
		glMatrix.mat4.translate(transMat, transMat, [0.0, -2.5, 0.0]);

		material.setModel(transMat);
		material2.setModel(transMat);



		gl.viewport(0, 0, canvas.width, canvas.height); 
		renderer.clear([0.3, 1.0, 0.4, 1.0]); 

		renderer.draw(amogusIdle, material); 
		renderer.draw(amogusEye, material2); 
		
		window.requestAnimationFrame(onFrame);
	}
	window.requestAnimationFrame(onFrame);
}