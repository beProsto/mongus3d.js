function beginGame() {
	createScreenFillingCanvas();
	ezgl.init();
	document.getElementById("main").innerHTML = "";

	const game = new Game();
	const time = new Time();
	const fsPtrLock = new FullscreenPointerLocker();
	function frame(now) {
		fsPtrLock.update();
		time.update(now);
		game.update(time.delta);
		mouse.velocity = [0.0, 0.0];
		mouse.wheel = 0.0;
		window.requestAnimationFrame(frame);
	}
	window.requestAnimationFrame(frame);
}