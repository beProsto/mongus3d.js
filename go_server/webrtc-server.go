package main

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"time"

	"github.com/pion/webrtc/v3"
	"github.com/wawesomeNOGUI/webrtcGameTemplate/signal"
)

var api *webrtc.API
var udpListener *net.UDPConn

func setupWRTCServer(ipa0 int, ipa1 int, ipa2 int, ipa3 int) {
	// Listen on UDP Port 80, will be used for all WebRTC traffic
	var err error
	udpListener, err = net.ListenUDP("udp", &net.UDPAddr{
		IP:   net.IP{byte(ipa0), byte(ipa1), byte(ipa2), byte(ipa3)},
		Port: 80,
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("Listening for WebRTC traffic at %s\n", udpListener.LocalAddr())

	// Create a SettingEngine, this allows non-standard WebRTC behavior
	settingEngine := webrtc.SettingEngine{}

	//Our Public Candidate is declared here cause were not using a STUN server for discovery
	//and just hardcoding the open port, and port forwarding webrtc traffic on the router
	settingEngine.SetNAT1To1IPs([]string{string(fmt.Sprintf("%d.%d.%d.%d", ipa0, ipa1, ipa2, ipa3))}, webrtc.ICECandidateTypeHost)

	// Configure our SettingEngine to use our UDPMux. By default a PeerConnection has
	// no global state. The API+SettingEngine allows the user to share state between them.
	// In this case we are sharing our listening port across many.
	settingEngine.SetICEUDPMux(webrtc.NewICEUDPMux(nil, udpListener))

	// Create a new API using our SettingEngine
	api = webrtc.NewAPI(webrtc.WithSettingEngine(settingEngine))

	http.HandleFunc("/conn", connWRTC)
}

func connWRTC(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Upgrade: ", err)
		return
	}
	defer c.Close()
	fmt.Println("User connected from: ", c.RemoteAddr())

	//===========This Player's Variables===================
	var playerTag string

	//===========WEBRTC====================================
	// Create a new RTCPeerConnection
	peerConnection, err := api.NewPeerConnection(webrtc.Configuration{})
	if err != nil {
		panic(err)
	}

	//Setup dataChannel to act like UDP with ordered messages (no retransmits)
	//with the DataChannelInit struct
	var udpPls webrtc.DataChannelInit
	var retransmits uint16 = 0

	//DataChannel will drop any messages older than
	//the most recent one received if ordered = true && retransmits = 0
	//This is nice so we can always assume client
	//side that the message received from the server
	//is the most recent update, and not have to
	//implement logic for handling old messages
	var ordered = true

	udpPls.Ordered = &ordered
	udpPls.MaxRetransmits = &retransmits

	// Create a datachannel with label 'UDP' and options udpPls
	dataChannel, err := peerConnection.CreateDataChannel("UDP", &udpPls)
	if err != nil {
		panic(err)
	}

	//Create a reliable datachannel with label "TCP" for all other communications
	reliableChannel, err := peerConnection.CreateDataChannel("TCP", nil)
	if err != nil {
		panic(err)
	}

	// Set the handler for ICE connection state

	// This will notify you when the peer has connected/disconnected
	peerConnection.OnICEConnectionStateChange(func(connectionState webrtc.ICEConnectionState) {
		fmt.Printf("ICE Connection State has changed: %s\n", connectionState.String())

		//3 = ICEConnectionStateConnected
		if connectionState == 3 {
			//Store a new x and y for this player
			NumberOfPlayers++
			playerTag = strconv.Itoa(NumberOfPlayers)
			fmt.Println(playerTag)

			//Store a slice for player x, z, yRotation, and other data
			//Initially we'll just have starting x, z and yRotation values
			Updates.Store(playerTag, []float32{0.0, 0.0, 0.0})

		} else if connectionState == 5 || connectionState == 6 || connectionState == 7 {
			Updates.Delete(playerTag)
			fmt.Println("Deleted Player " + playerTag)

			err := peerConnection.Close() //deletes all references to this peerconnection in mem and same for ICE agent (ICE agent releases the "closed" status)
			if err != nil {               //https://www.w3.org/TR/webrtc/#dom-rtcpeerconnection-close
				fmt.Println(err)
			}
		}
	})

	//====================No retransmits, ordered dataChannel=======================
	// Register channel opening handling
	dataChannel.OnOpen(func() {
		for {
			time.Sleep(time.Millisecond * 50) //50 milliseconds = 20 updates per second
			//20 milliseconds = ~60 updates per second

			//fmt.Println(UpdatesString)
			// Send the message as text so we can JSON.parse in javascript
			sendErr := dataChannel.SendText(UpdatesString)
			if sendErr != nil {
				fmt.Println("data send err", sendErr)
				break
			}
		}

	})

	// Register text message handling
	dataChannel.OnMessage(func(msg webrtc.DataChannelMessage) {
		fmt.Printf("Message from DataChannel '%s': '%s'\n", dataChannel.Label(), string(msg.Data))
	})

	//==============================================================================

	//=========================Reliable DataChannel=================================
	// Register channel opening handling
	reliableChannel.OnOpen(func() {

		//Send Client their playerTag so they know who they are in the Updates Array
		sendErr := reliableChannel.SendText(playerTag)
		if sendErr != nil {
			panic(err)
		}

	})

	// Register message handling (Data all served as a bytes slice []byte)
	// for user controls
	reliableChannel.OnMessage(func(msg webrtc.DataChannelMessage) {
		//fmt.Printf("Message from DataChannel '%s': '%s'\n", reliableChannel.Label(), string(msg.Data))

		//fmt.Println(msg.Data)
		if msg.Data[0] == 'X' {
			x, err := strconv.ParseFloat(string(msg.Data[1:]), 32)
			if err != nil {
				fmt.Println(err)
			}

			xF32 := float32(x)

			playerSlice, ok := Updates.Load(playerTag)
			if !ok {
				fmt.Println("Uh oh")
			}

			playerSlice.([]float32)[0] = xF32
			Updates.Store(playerTag, playerSlice)
		} else if msg.Data[0] == 'Z' {
			z, err := strconv.ParseFloat(string(msg.Data[1:]), 32)
			if err != nil {
				fmt.Println(err)
			}

			zF32 := float32(z)

			playerSlice, ok := Updates.Load(playerTag)
			if !ok {
				fmt.Println("Uh oh")
			}

			playerSlice.([]float32)[1] = zF32
			Updates.Store(playerTag, playerSlice)
		} else if string(msg.Data[:2]) == "YR" {
			yRot, err := strconv.ParseFloat(string(msg.Data[2:]), 32)
			if err != nil {
				fmt.Println(err)
			}

			yRotF32 := float32(yRot)

			playerSlice, ok := Updates.Load(playerTag)
			if !ok {
				fmt.Println("Uh oh")
			}

			playerSlice.([]float32)[2] = yRotF32
			Updates.Store(playerTag, playerSlice)
		}
	})

	//==============================================================================

	// Create an offer to send to the browser
	offer, err := peerConnection.CreateOffer(nil)
	if err != nil {
		panic(err)
	}

	// Create channel that is blocked until ICE Gathering is complete
	gatherComplete := webrtc.GatheringCompletePromise(peerConnection)

	// Sets the LocalDescription, and starts our UDP listeners
	err = peerConnection.SetLocalDescription(offer)
	if err != nil {
		panic(err)
	}

	// Block until ICE Gathering is complete, disabling trickle ICE
	// we do this because we only can exchange one signaling message
	// in a production application you should exchange ICE Candidates via OnICECandidate
	<-gatherComplete

	fmt.Println(*peerConnection.LocalDescription())

	//Send the SDP with the final ICE candidate to the browser as our offer
	err = c.WriteMessage(1, []byte(signal.Encode(*peerConnection.LocalDescription()))) //write message back to browser, 1 means message in byte format?
	if err != nil {
		fmt.Println("write:", err)
	}

	//Wait for the browser to send an answer (its SDP)
	msgType, message, err2 := c.ReadMessage() //ReadMessage blocks until message received
	if err2 != nil {
		fmt.Println("read:", err)
	}

	answer := webrtc.SessionDescription{}

	signal.Decode(string(message), &answer) //set answer to the decoded SDP
	fmt.Println(answer, msgType)

	// Set the remote SessionDescription
	err = peerConnection.SetRemoteDescription(answer)
	if err != nil {
		panic(err)
	}

	//=====================Trickle ICE==============================================
	//Make a new struct to use for trickle ICE candidates
	var trickleCandidate webrtc.ICECandidateInit
	var leftBracket uint8 = 123 //123 = ascii value of "{"

	for {
		_, message, err2 := c.ReadMessage() //ReadMessage blocks until message received
		if err2 != nil {
			fmt.Println("read:", err)
		}

		//If staement to make sure we aren't adding websocket error messages to ICE
		if message[0] == leftBracket {
			//Take []byte and turn it into a struct of type webrtc.ICECandidateInit
			//(declared above as trickleCandidate)
			err := json.Unmarshal(message, &trickleCandidate)
			if err != nil {
				fmt.Println("errorUnmarshal:", err)
			}

			fmt.Println(trickleCandidate)

			err = peerConnection.AddICECandidate(trickleCandidate)
			if err != nil {
				fmt.Println("errorAddICE:", err)
			}
		}

	}

}
