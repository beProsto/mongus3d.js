let nick = "";

function beginGame() {
	createScreenFillingCanvas();
	ezgl.init();
	document.getElementById("main").innerHTML = "";

	const renderer = new ezgfx.Renderer(); 
	renderer.depthTesting(true); 
	
	const camera = new Camera();
	camera.position[1] = 4.3;

	const players = new Players();

	canvas.requestFullscreen();
	
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

		camera.rotationY -= mouse.velocity[0] * deltaTime;
		camera.rotationX -= mouse.velocity[1] * deltaTime;

		if(camera.rotationX > 1.570795) camera.rotationX = 1.570795;
		if(camera.rotationX < -1.570795) camera.rotationX = -1.570795;

		let dir = glMatrix.mat4.create(); 
		transformTRS(dir, dir, [0.0, 0.0, 0.0], [0.0, camera.rotationY, 0.0]);
		
		let forward = glMatrix.vec4.create();
		forward[2] = -1.0;
		glMatrix.vec4.transformMat4(forward, forward, dir);

		if(pressedKeys["KeyD"]) {
			camera.positionX -= forward[2] * deltaTime * 10.0;
			camera.positionZ += forward[0] * deltaTime * 10.0;
		}
		if(pressedKeys["KeyA"]) {
			camera.positionX += forward[2] * deltaTime * 10.0;
			camera.positionZ -= forward[0] * deltaTime * 10.0;
		}
		if(pressedKeys["KeyW"] || mouse.wheel > 0.0) {
			camera.positionX += forward[0] * deltaTime * 10.0;
			camera.positionZ += forward[2] * deltaTime * 10.0;
		}
		if(pressedKeys["KeyS"] || mouse.wheel < 0.0) {
			camera.positionX -= forward[0] * deltaTime * 10.0;
			camera.positionZ -= forward[2] * deltaTime * 10.0;
		}

		camera.aspect = canvas.width / canvas.height;

		gl.viewport(0, 0, canvas.width, canvas.height); 
		renderer.clear([0.3, 1.0, 0.4, 1.0]); 

		players.renderPlayer(renderer, camera);
		
		mouse.velocity = [0.0, 0.0];
		mouse.wheel = 0.0;

		window.requestAnimationFrame(onFrame);
	}
	window.requestAnimationFrame(onFrame);
	
	// for (const [key, value] of Object.entries(objects)) {
	// 	value.free();
	// }
}