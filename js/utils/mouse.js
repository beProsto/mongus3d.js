let mouse = {position: [0.0, 0.0], velocity: [0.0, 0.0], pressedButtons: [false, false, false, false, false], wheel: 0.0, _touchintlpos: [0.0, 0.0]};
window.onmousemove = function(e) { 
	mouse.position[0] = e.clientX; 
	mouse.position[1] = e.clientY; 
	mouse.velocity[0] = e.movementX;
	mouse.velocity[1] = e.movementY;
};
window.onmousedown = function(e) { mouse.pressedButtons[e.button] = true; };
window.onmouseup = function(e) { mouse.pressedButtons[e.button] = false; };
window.onwheel = function(e) { mouse.wheel = e.deltaY; };

window.ontouchmove = function(e) { 
	mouse.position[0] = e.touches[0].clientX; 
	mouse.position[1] = e.touches[0].clientY; 
	mouse.velocity[0] = mouse.position[0] - mouse._touchintlpos[0];
	mouse.velocity[1] = mouse.position[1] - mouse._touchintlpos[1];
	mouse._touchintlpos[0] = mouse.position[0];
	mouse._touchintlpos[1] = mouse.position[1];
};
window.ontouchstart = function(e) { 
	mouse.position[0] = e.touches[0].clientX; 
	mouse.position[1] = e.touches[0].clientY; 
	mouse.velocity[0] = 0.0;
	mouse.velocity[1] = 0.0;
	mouse._touchintlpos[0] = mouse.position[0];
	mouse._touchintlpos[1] = mouse.position[1];
	
	mouse.pressedButtons[0] = true; 
};
window.ontouchend = function(e) { mouse.pressedButtons[0] = false; };
window.ontouchcancel = function(e) { mouse.pressedButtons[0] = false; };

window.oncontextmenu = function(e) { return false; };