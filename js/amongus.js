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

// Setting up the multiplayer WebRTC connection

//Data Channels
let UDPChan;
let TCPChan;

//Player Vars
let playerTag;
let Updates;
let previousUpdates;

let ws;

// I'm going to leave it as and event listener addition, but remember that it's not how I usually do it lol.
window.addEventListener("load", (evt) => {
	ws = new WebSocket("ws://192.168.1.54:80/echo");	//address to connect to, /echo triggers go echo function

	ws.onopen = function(evt) {
		console.log("OPEN");
	}
	ws.onclose = function(evt) {
			console.log("CLOSE");
			ws = null;
	}
	ws.onmessage = function(evt) {
			console.log("RESPONSE: " + evt.data);
			//we're expecting the first websocket message to be the server's SDP
			//so we'll go ahead and start the WEBRTC session with that SDP
			window.startSession(evt.data)
	}
	ws.onerror = function(evt) {
			console.log("ERROR: " + evt.data);
	}

	//=====================WEBRTC===========================

	const pc = new RTCPeerConnection({
		iceServers: [
			{
				urls: 'stun:stun.l.google.com:19302'
			}
		]
	})


	var sends = 0;

	pc.onsignalingstatechange = e => console.log(pc.signalingState)
	pc.oniceconnectionstatechange = e => {
		console.log(pc.iceConnectionState)
		if (pc.iceConnectionState == "connected") {
			animate(step); //=================== STARTS THE GAME - Means multiplayer is enabled by this point ============================
		}
	}
	pc.onicecandidate = event => {
		if(sends == 0){
			//Send the original SDP, we'll send additional ice candidates from the
			//onicecandidate event handler (trickle ICE)
			ws.send( btoa(JSON.stringify(pc.localDescription)) )
			console.log(pc.LocalDescription)

			sends = 1
		}
		//console.log(event.candidate)
		ws.send(JSON.stringify(event.candidate))
	}



	var previousData = 0;
	var numMessages = 0;

	function howManyMessages(){
		console.log(numMessages + " Messages Received");
	}
	setInterval(howManyMessages, 100000);

	pc.ondatachannel = e => {
		if(e.channel.label == "UDP") {
			UDPChan = e.channel;
			console.log('New DataChannel ' + UDPChan.label);
			console.log("Ordered: " + UDPChan.ordered);
			console.log("MaxRetransmits: " + UDPChan.maxRetransmits);
			console.log("\n");
			UDPChan.onclose = () => console.log(UDPChan.label + ' has closed');
			UDPChan.onopen = () => console.log(UDPChan.label + ' has opened');

			UDPChan.onmessage = (e) => {
				numMessages++;
				//Save previous update to use for entity interpolation
				previousUpdates = Updates;
				Updates = JSON.parse(e.data);
				//console.log(e.data);
			};
		}
		else if(e.channel.label == "TCP") {
			TCPChan = e.channel;
			console.log('New DataChannel ' + TCPChan.label);
			console.log("Ordered: " + TCPChan.ordered);
			console.log("MaxRetransmits: " + TCPChan.maxRetransmits);
			console.log("\n");
			TCPChan.onclose = () => console.log(TCPChan.label + ' has closed');
			TCPChan.onopen = () => console.log(TCPChan.label + ' has opened');
			TCPChan.onmessage = function(e){
				//The first message is expexted to be the player tag
				playerTag = e.data;
			};
			/* // This code is not used by us at all lol
			// Still gonna keep it for no reason for a second
			window.sendMessage = () => {
				let message = document.getElementById('message').value
				if (message === '') {
					return alert('Message must not be empty')
				}

				TCPChan.send(message)
			};
			*/
		}
	}

	window.startSession = (e) => {
		let sd = e;
		if (sd === '') {
			return alert('Session Description must not be empty')
		}

		pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(sd)))).catch(console.log)
		console.log("Pog")
		pc.createAnswer().then(d => pc.setLocalDescription(d)).catch(console.log)
	}
});