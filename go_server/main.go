package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	//"reflect"
	//"encoding/binary"

	"github.com/gorilla/websocket"

	"github.com/pion/webrtc/v3"
	"github.com/wawesomeNOGUI/webrtcGameTemplate/signal"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var api *webrtc.API

func echo(w http.ResponseWriter, r *http.Request) {
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

//We'll have this marshalling function here so the multiple gorutines for each
//player will not be inefficient by all trying to marshall the same thing
func getSyncMapReadyForSending(m *sync.Map) {
	for {
		time.Sleep(time.Millisecond)

		tmpMap := make(map[string][]float32)
		m.Range(func(k, v interface{}) bool {
			tmpMap[k.(string)] = v.([]float32)
			return true
		})

		jsonTemp, err := json.Marshal(tmpMap)
		if err != nil {
			panic(err)
		}

		UpdatesString = string(jsonTemp)
	}
}

type nickname struct {
	id       int
	nickname string
}

var nicknames = make([]nickname, 0)

func nicknamecheck(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Nickname recieved:\n")
	responseData, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintf(w, "ErrNickFound")
		fmt.Println(err)
		return
	}

	responseString := string(responseData)

	whereClientId := strings.Index(responseString, ":")
	if whereClientId == -1 {
		fmt.Fprintf(w, "ErrNickFound")
		fmt.Println("Improper nick format passed")
		return
	}

	idStr := responseString[:whereClientId]
	idNum, err := strconv.Atoi(idStr)
	if err != nil {
		fmt.Fprintf(w, "ErrNickFound")
		fmt.Println(err)
		return
	}

	nickStr := responseString[whereClientId+1:]

	for _, v := range nicknames {
		if nickStr == v.nickname {
			fmt.Fprintf(w, "ErrNickFound")
			fmt.Println("Err: Nickname found!")
			return
		}
	}

	nick := nickname{idNum, nickStr}
	nicknames = append(nicknames, nick)

	fmt.Fprintf(w, "Posted")
	fmt.Println(nicknames)
}

//Updates Map
var Updates sync.Map
var UpdatesString string
var NumberOfPlayers int

func main() {
	go getSyncMapReadyForSending(&Updates)

	// Listen on UDP Port 80, will be used for all WebRTC traffic
	udpListener, err := net.ListenUDP("udp", &net.UDPAddr{
		IP:   net.IP{0, 0, 0, 0},
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
	settingEngine.SetNAT1To1IPs([]string{"127.0.0.1"}, webrtc.ICECandidateTypeHost)

	// Configure our SettingEngine to use our UDPMux. By default a PeerConnection has
	// no global state. The API+SettingEngine allows the user to share state between them.
	// In this case we are sharing our listening port across many.
	settingEngine.SetICEUDPMux(webrtc.NewICEUDPMux(nil, udpListener))

	// Create a new API using our SettingEngine
	api = webrtc.NewAPI(webrtc.WithSettingEngine(settingEngine))

	fileServer := http.FileServer(http.Dir("../"))
	http.HandleFunc("/echo", echo)                   //this request comes from webrtc.html
	http.HandleFunc("/nicknamecheck", nicknamecheck) //this request comes from webrtc.html
	http.Handle("/", fileServer)

	err = http.ListenAndServe(":80", nil) //Http server blocks
	if err != nil {
		panic(err)
	}
}

// package name - if it's "main", then it's a compilable (runable) package, or as I like to call it, a program
// package main

// imports other packages, the ones that are not runable most likely

// // the main function
// // or as I like to call it
// // the program
// func main() {
// 	// constants - value can't be changed
// 	const rhyme = "The quick brown fox jumps over the lazy dog"

// 	// variables - you can change the values
// 	var apple string = "apple"
// 	pineapple := "pineapple"

// 	var floatThirtytwo float32 = 1.0
// 	floatSixtyFour := 2.0 * math.Pi

// 	// formatted print - https://golang.org/pkg/fmt/ for the rules of formatting
// 	fmt.Printf("pen %s %s pen\n%T: %g\n%T: %g\n%s\n", pineapple, apple, floatThirtytwo, floatThirtytwo, floatSixtyFour, floatSixtyFour, rhyme)

// 	// for loop
// 	for i := 1; i <= 10; i++ {
// 		if i == 5 || i == 8 {
// 			// continue tag skips the current cycle of the loop
// 			continue
// 		}

// 		// tests if the first bit is on (1) or off (0) - if it's on (1) the number will be odd, because it has an odd number (2^0) added to it
// 		if i&1 == 1 {
// 			fmt.Printf("%d is odd\n", i)
// 		} else {
// 			fmt.Printf("%d is even\n", i)
// 		}
// 	}

// 	// a switch statement - tests for the values of time.Now().Weekday(), which returns what I assume to be an enum of what the current day is
// 	switch time.Now().Weekday() {
// 	case time.Monday:
// 		{
// 			floatThirtytwo += 1.0 // an example of modifying variable's values
// 			fmt.Printf("I hate mondays.\n")

// 		}
// 	case time.Friday:
// 		{
// 			floatThirtytwo += 2.0
// 			fmt.Printf("It's almost weekend!\n")
// 		}
// 	case time.Saturday:
// 		{
// 			floatThirtytwo += 2.5
// 			fmt.Printf("Let's Party!\n")
// 		}
// 	case time.Sunday:
// 		{
// 			floatThirtytwo += 3.0
// 			fmt.Printf("Oh no\n")
// 		}
// 	default: // default statement is an "else" but for switch statements instead of if's
// 		{
// 			floatThirtytwo += 1.5
// 			fmt.Printf("Another boring day...\n")
// 		}
// 	}

// 	// lambdas are functions represented as variables (functions inside of other functions and such let's say)
// 	// the main difference between a normal function and a lambda is that a lambda can work with the local variables without them being passed into it as arguments
// 	simpleLambda := func(_i int32) float32 {
// 		return float32(_i) * floatThirtytwo
// 	}

// 	// we scan for an input from user
// 	fmt.Printf("Please enter a natural number: ")

// 	var toScan int32
// 	fmt.Scanf("%d", &toScan) // we give it a pointer to our variable here btw

// 	// we use the input as the argument for our lambda
// 	fmt.Printf("%d multiplied by %g is %g\n\n", toScan, floatThirtytwo, simpleLambda(toScan))

// 	// arrays
// 	var arraySix [6]int

// 	fmt.Println("This is how a new array looks like: ", arraySix)

// 	for i := 0; i < len(arraySix); i++ {
// 		if arraySix[i] = i; i&1 == 1 {
// 			arraySix[i] = -i
// 		}
// 	}

// 	fmt.Println("This is how a modified array looks like for example: ", arraySix)

// 	arrayFour := [4]int{3, 2, 1, 0}

// 	fmt.Println("This is how an array initialised along with values looks like: ", arrayFour)
// 	fmt.Println()

// 	// slices
// 	// slices are like more advanced arrays (for some reason)
// 	// why? just why? every other language just creates a new array when we slice one
// 	// why go and create a completely other type that is more advanced?
// 	// why isn't it just arrays instead of seperate arrays and slices?
// 	// this will most likely lead to me just using slices and no arrays
// 	// like
// 	// wtf

// 	sliceDyn := make([]int, 2) // we create slices using a method VERY similiar to arrays. just not the same one lol
// 	fmt.Println("This is how a slice looks like when initialised: ", sliceDyn)

// 	// setting the values looks just like in a normal array
// 	sliceDyn[1] = 1
// 	sliceDyn[0] = 2

// 	for i := 0; i > -8; i-- {
// 		sliceDyn = append(sliceDyn, i) // this is how adding (pushing) new values into the arra- I mean slice looks like
// 	}

// 	fmt.Println("This is how a slice looks like when modified: ", sliceDyn)

// 	for {
// 		var sliceStart int
// 		var sliceEnd int

// 		fmt.Println("Type in how you want to slice the slice: ")

// 		fmt.Scanf("%d %d", &sliceStart, &sliceEnd)

// 		if sliceStart == -1 {
// 			break
// 		}
// 		if sliceStart == 0 && sliceEnd == 0 {
// 			continue
// 		}

// 		fmt.Printf("sliceDyn[%d:%d] = ", sliceStart, sliceEnd)
// 		fmt.Println(sliceDyn[sliceStart:sliceEnd])
// 		fmt.Println()
// 	}

// }
