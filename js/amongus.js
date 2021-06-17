const nickCheckUrl = "/nicknamecheck";
let nick = "";

let gameBegun  = false;

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
					if(!gameBegun) {
						gameBegun = true;
						beginGame();
					}
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

function beginGame() {
	if(canvas == null) { canvas = document.createElement("canvas"); } 
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

	const camera = new Camera();

	const amogusIdle = new ezgfx.Mesh();
	amogusIdle.loadFromOBJ("/obj/amongus_idle.obj");
	const amogusEye = new ezgfx.Mesh();
	amogusEye.loadFromOBJ("/obj/amongus_eyes.obj");
	
	let tmat = glMatrix.mat4.create();
	transformTRS(tmat, ezgfxGlobals.identityMatrix, [0.0, 0.0, -5.0]);

	const material = new ezgfx.Material();
	material.setModel(tmat);
	const material2 = new ezgfx.Material();
	material2.setModel(tmat);

	material.setColor([1.0, 0.3, 0.3, 1.0]);
	material2.setColor([0.3, 0.3, 1.0, 1.0]);

	canvas.requestFullscreen();
	
	camera.position[1] = 4.3;

	let lastTime = Date.now();
	let pointer_locked = false;
	function onFrame(now) { 
		if(!pointer_locked) {
			if(!(document.pointerLockElement === canvas)) {
				canvas.requestPointerLock();
			}
			else {
				pointer_locked = true;
			}
		}

		const deltaTime = (now - lastTime) / 1000.0;
		lastTime = now;

		console.log(deltaTime);

		camera.rotation = [camera.rotation[0], camera.rotation[1] - mouse.velocity[0] * deltaTime, camera.rotation[2]];
		camera.rotation = [camera.rotation[0] - mouse.velocity[1] * deltaTime, camera.rotation[1], camera.rotation[2]];

		let dir = glMatrix.mat4.create(); 
		transformTRS(dir, dir, [0.0, 0.0, 0.0], camera.rotation);
		
		let forward = glMatrix.vec4.create();
		forward[2] = -1.0;
		glMatrix.vec4.transformMat4(forward, forward, dir);

		if(pressedKeys["KeyD"] || pressedKeys["ArrowRight"]) {
			camera.position[0] -= forward[2] * deltaTime * 10.0;
			camera.position[2] += forward[0] * deltaTime * 10.0;
		}
		if(pressedKeys["KeyA"] || pressedKeys["ArrowLeft"]) {
			camera.position[0] += forward[2] * deltaTime * 10.0;
			camera.position[2] -= forward[0] * deltaTime * 10.0;
		}
		if(pressedKeys["KeyW"] || pressedKeys["ArrowUp"]) {
			camera.position[0] += forward[0] * deltaTime * 10.0;
			camera.position[2] += forward[2] * deltaTime * 10.0;
		}
		if(pressedKeys["KeyS"] || pressedKeys["ArrowDown"]) {
			camera.position[0] -= forward[0] * deltaTime * 10.0;
			camera.position[2] -= forward[2] * deltaTime * 10.0;
		}

		camera.aspect = canvas.width / canvas.height;

		camera.applyMatrices(material);
		camera.applyMatrices(material2);

		gl.viewport(0, 0, canvas.width, canvas.height); 
		renderer.clear([0.3, 1.0, 0.4, 1.0]); 

		renderer.draw(amogusIdle, material); 
		renderer.draw(amogusEye, material2); 
		
		mouse.velocity = [0.0, 0.0];

		window.requestAnimationFrame(onFrame);
	}
	window.requestAnimationFrame(onFrame);
}