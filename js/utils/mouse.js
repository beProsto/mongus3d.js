// Everything besides _touchintlpos is the mouse's interface
let mouse = {
	position: [0.0, 0.0],
	velocity: [0.0, 0.0],
	pressedButtons: [false, false, false, false, false],
	wheel: 0.0,
	ammount: 1,

	inRect: (rectX, rectY, rectW, rectH, needsToBePressed = false) => {
		for(let i = 0; i < this.ammount; i++) {
			const x = position[i * 2];
			const y = position[i * 2 + 1];
			if(x < rectX || x > rectX + rectW || y < rectY || y > rectY + rectH || (needsToBePressed ? pressedButtons[i*5] : false)) {
				continue;
			}

			return {
				id: i,
				x: x,
				y: y,
				xVel: velocity[i*2],
				yVel: velocity[i*2 + 1],
				xRel: x - rectX,
				yRel: y - rectY
			};

		}
		return null;
	},
	inCircle: (circleX, circleY, circleR, needsToBePressed = false) => {
		for(let i = 0; i < this.ammount; i++) {
			const x = position[i * 2];
			const y = position[i * 2 + 1];
			
			const outx = x - circleX;
			const outy = y - circleY;

			if(Math.sqrt(outx*outx + outy*outy) > circleR || (needsToBePressed ? pressedButtons[i*5] : false)) {
				continue;
			}

			return {
				id: i,
				x: x,
				y: y,
				xVel: velocity[i*2],
				yVel: velocity[i*2 + 1],
				xRel: outx,
				yRel: outy
			};

		}
		return null;
	},

	_touchintlpos: [0.0, 0.0]
};

// The pc mouse interface is pretty straight forward
window.onmousemove = (e) => {
	mouse.position[0] = e.clientX * window.devicePixelRatio; 
	mouse.position[1] = e.clientY * window.devicePixelRatio; 
	mouse.velocity[0] = e.movementX;
	mouse.velocity[1] = e.movementY;
};
window.onmousedown = (e) => {
	mouse.pressedButtons[e.button] = true;
};
window.onmouseup = (e) => {
	mouse.pressedButtons[e.button] = false;
};
window.onwheel = (e) => {
	mouse.wheel = e.deltaY;
};

// This is where things get retarded
window.ontouchstart = (e) => {
	for(const touch of e.changedTouches) {
		mouse.position[touch.identifier * 2 + 0] = touch.clientX * window.devicePixelRatio; 
		mouse.position[touch.identifier * 2 + 1] = touch.clientY * window.devicePixelRatio; 
		mouse.velocity[touch.identifier * 2 + 0] = 0.0;
		mouse.velocity[touch.identifier * 2 + 1] = 0.0;
		mouse._touchintlpos[touch.identifier * 2 + 0] = mouse.position[0];
		mouse._touchintlpos[touch.identifier * 2 + 1] = mouse.position[1];
		
		mouse.pressedButtons[touch.identifier * 5 + 0] = true; 
	}

	mouse.ammount = e.touches.length;
};
window.ontouchmove = (e) => {
	for(const touch of e.changedTouches) {
		mouse.position[touch.identifier * 2 + 0] = touch.clientX * window.devicePixelRatio; 
		mouse.position[touch.identifier * 2 + 1] = touch.clientY * window.devicePixelRatio; 
		mouse.velocity[touch.identifier * 2 + 0] = mouse.position[touch.identifier * 2 + 0] - mouse._touchintlpos[touch.identifier * 2 + 0];
		mouse.velocity[touch.identifier * 2 + 1] = mouse.position[touch.identifier * 2 + 1] - mouse._touchintlpos[touch.identifier * 2 + 1];
		mouse._touchintlpos[touch.identifier * 2 + 0] = mouse.position[touch.identifier * 2 + 0];
		mouse._touchintlpos[touch.identifier * 2 + 1] = mouse.position[touch.identifier * 2 + 1];
	}
};
window.ontouchcancel = window.ontouchend = (e) => {
	for(const touch of e.changedTouches) {
		mouse.pressedButtons[touch.identifier * 5 + 0] = false; 
		mouse.velocity[touch.identifier * 2 + 0] = 0.0;
		mouse.velocity[touch.identifier * 2 + 1] = 0.0;
	}

	if(e.touches.length == 0) {
		mouse.ammount = e.touches.length;
	}
};

// prevents the context menu from appearing
window.oncontextmenu = (e) => { return false; };