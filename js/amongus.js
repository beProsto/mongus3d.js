const nickCheckUrl = "/nicknamecheck";

const playButton = document.getElementById("play-button");
playButton.disabled = true;
playButton.innerText = "Connecting...";

playButton.onclick = () => {
	if(!playButton.disabled) {
		playButton.disabled = true;

		if(document.getElementById("nickInput").value) {
			globals.nick = globals.playerTag + ":" + document.getElementById("nickInput").value;
			let xhr = new XMLHttpRequest();
			xhr.open("PUT", nickCheckUrl); 
			xhr.onload = () => {
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

// Setting up the multiplayer WebRTC connection

let sends = 0;
let numMessages = 0;
let ipaddr = "";

window.addEventListener("load", (evt) => {
	fetch("/ip").then(response => {
		response.text().then(ipaddrfetched => {
			ipaddr = ipaddrfetched;
			globals.ws = new WebSocket("ws://" + ipaddr + ":80/echo");	//address to connect to, /echo triggers go echo function
			establishConnection();
		});
	});
});

function establishConnection() {
	globals.ws.onopen = (evt) => {
		console.log("OPEN");
	};
	globals.ws.onclose = (evt) => {
			console.log("CLOSE");
			globals.ws = null;
	};
	globals.ws.onmessage = (evt) => {
			console.log("RESPONSE: " + evt.data);
			//we're expecting the first websocket message to be the server's SDP
			//so we'll go ahead and start the WEBRTC session with that SDP
			window.startSession(evt.data)
	};
	globals.ws.onerror = (evt) => {
			console.log("ERROR: " + evt.data);
	};

	//=====================WEBRTC===========================

	const pc = new RTCPeerConnection({
		iceServers: [
			{
				urls: 'stun:stun.l.google.com:19302'
			}
		]
	});


	pc.onsignalingstatechange = (e) => console.log(pc.signalingState);
	pc.oniceconnectionstatechange = (e) => {
		console.log(pc.iceConnectionState);
		if (pc.iceConnectionState == "connected") {
			playButton.disabled = false; //=================== STARTS THE GAME - Means multiplayer is enabled by this point ============================
			playButton.innerText = "pley";
		}
	};
	pc.onicecandidate = event => {
		if(sends == 0) {
			//Send the original SDP, we'll send additional ice candidates from the
			//onicecandidate event handler (trickle ICE)
			globals.ws.send(btoa(JSON.stringify(pc.localDescription))); // sends an encoded (base64) version of a strigified local descriptor 
			console.log(pc.LocalDescription);

			sends = 1;
		}
		//console.log(event.candidate)
		globals.ws.send(JSON.stringify(event.candidate));
	};


	setInterval(() => {
		console.log(numMessages + " Messages Received");
	}, 100000);

	pc.ondatachannel = e => {
		if(e.channel.label == "UDP") {
			globals.UDPChan = e.channel;
			console.log('New DataChannel ' + globals.UDPChan.label);
			console.log("Ordered: " + globals.UDPChan.ordered);
			console.log("MaxRetransmits: " + globals.UDPChan.maxRetransmits);
			console.log("\n");
			globals.UDPChan.onclose = () => console.log(globals.UDPChan.label + ' has closed');
			globals.UDPChan.onopen = () => console.log(globals.UDPChan.label + ' has opened');

			globals.UDPChan.onmessage = (e) => {
				numMessages++;
				//Save previous update to use for entity interpolation
				globals.previousUpdates = globals.Updates;
				globals.Updates = JSON.parse(e.data);
				//console.log(e.data);
			};
		}
		else if(e.channel.label == "TCP") {
			globals.TCPChan = e.channel;
			console.log('New DataChannel ' + globals.TCPChan.label);
			console.log("Ordered: " + globals.TCPChan.ordered);
			console.log("MaxRetransmits: " + globals.TCPChan.maxRetransmits);
			console.log("\n");
			globals.TCPChan.onclose = () => console.log(globals.TCPChan.label + ' has closed');
			globals.TCPChan.onopen = () => console.log(globals.TCPChan.label + ' has opened');
			globals.TCPChan.onmessage = (e) => {
				//The first message is expexted to be the player tag
				globals.playerTag = e.data;
			};
		}
	};

	window.startSession = (e) => {
		let sd = e;
		if (sd === '') {
			return alert('Session Description must not be empty');
		}

		pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(sd)))).catch(console.log);
		console.log("Pog");
		pc.createAnswer().then(d => pc.setLocalDescription(d)).catch(console.log);
	};
}