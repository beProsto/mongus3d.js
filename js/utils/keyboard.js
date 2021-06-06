let pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.code] = false; };
window.onkeydown = function(e) { pressedKeys[e.code] = true; };