let nick = "";

function beginGame() {
	createScreenFillingCanvas();
	ezgl.init();
	document.getElementById("main").innerHTML = "";

	const objects = {};

	const renderer = new ezgfx.Renderer(); 
	renderer.depthTesting(true); 
	renderer.clear([0.3, 1.0, 0.4, 1.0]); 

	const camera = new Camera();

	objects.amogusIdle = new ezgfx.Mesh();
	objects.amogusIdle.loadFromOBJ("/obj/amongus_idle.obj");
	objects.amogusEye = new ezgfx.Mesh();
	objects.amogusEye.loadFromOBJ("/obj/amongus_eyes.obj");
	
	let tmat = glMatrix.mat4.create();
	transformTRS(tmat, ezgfxGlobals.identityMatrix, [0.0, 0.0, -5.0]);

	objects.material = new ezgfx.Material();
	objects.material.setModel(tmat);
	objects.material2 = new ezgfx.Material();
	objects.material2.setModel(tmat);

	objects.material.setColor([1.0, 0.3, 0.3, 1.0]);
	objects.material2.setColor([0.3, 0.3, 1.0, 1.0]);

	canvas.requestFullscreen();
	
	camera.position[1] = 4.3;
	camera.rotation[0] = 0.0;

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

		camera.applyMatrices(objects.material);
		camera.applyMatrices(objects.material2);

		gl.viewport(0, 0, canvas.width, canvas.height); 
		renderer.clear([0.3, 1.0, 0.4, 1.0]); 

		renderer.draw(objects.amogusIdle, objects.material); 
		renderer.draw(objects.amogusEye, objects.material2); 
		
		mouse.velocity = [0.0, 0.0];
		mouse.wheel = 0.0;

		window.requestAnimationFrame(onFrame);
	}
	window.requestAnimationFrame(onFrame);
	
	// for (const [key, value] of Object.entries(objects)) {
	// 	value.free();
	// }
}