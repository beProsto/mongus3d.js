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

function beginGame() {
	alert("gra rozpoczęta")
}