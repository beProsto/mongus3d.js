let canvas = null;

function createScreenFillingCanvas() {
	if(!canvas) { canvas = document.createElement("canvas"); } 
	canvas.style = "position: absolute; width: 100%; height: 100%; left: 0; top: 0; right: 0; bottom: 0; margin: 0; z-index: -1;";
	document.body.appendChild(canvas); 
	
	window.onresize = function () { 
		canvas.width = canvas.clientWidth * window.devicePixelRatio;
		canvas.height = canvas.clientHeight * window.devicePixelRatio;
	};
	window.onresize();
}