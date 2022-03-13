class Networking {
	constructor() {
		this.webRTC = false;
	}

	
}

const Networking = {
	commType: "", // Either "WRTC" or "WS"
	CommWRTC: class {
		constructor() {

		}
	},
	CommWS: class {
		constructor() {
			
		}
		sendRel(data) {

		}
		sendUnr(data) {

		}
	},
	Communication: class {
		constructor() {
			this.comm = null;
			this.interval = 0;
			if(Networking.commType == "WRTC") {
				this.comm = new Networking.CommWRTC();
				this.interval = 20;
			}
			else {
				this.comm = new Networking.CommWS();
				this.interval = 50;
			}

			this.relDataToSend = "";
			this.unrDataToSend = "";

			setInterval(() => {
				if(this.relDataToSend != "") {
					this.comm.sendRel(this.relDataToSend);
					this.relDataToSend = "";
				}
				if(this.unrDataToSend != "") {
					this.comm.sendUnr(this.unrDataToSend);
					this.unrDataToSend = "";
				}
			}, this.interval);

		}

		sendTCP(data) {
			this.relDataToSend = data;
		}
		sendUDP(data) {
			this.unrDataToSend = data;
		}

	}
};