const nickCheckUrl = "/nicknamecheck";

const playButton = document.getElementById("play-button");

playButton.onclick = function() {
	if(!playButton.disabled) {
		playButton.disabled = true;

		if(document.getElementById("nickInput").value) {
			globals.nick = document.getElementById("nickInput").value;
			let xhr = new XMLHttpRequest();
			xhr.open("PUT", nickCheckUrl); 
			xhr.onload = function () {
				let txt = xhr.responseText;
				if (xhr.readyState == 4 && (xhr.status == "201" || xhr.status == "200")) {
					if(txt == "ErrNickFound") {
						playButton.disabled = false;
						alert("gracz z tym pseudonimem już dołączył");
					}
					else if(txt == "Posted") {
						beginGame();
					}
				} else {
					playButton.disabled = false;
					console.error(txt);
				}
			};
			xhr.send(globals.nick);
		}
		else {
			playButton.disabled = false;
			alert("Widzisz ten textbox?");
		}
	}
};