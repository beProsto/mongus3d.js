package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	//"reflect"
	//"encoding/binary"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
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

// var Clients sync.Map

// func chat(w http.ResponseWriter, r *http.Request) {
// 	c, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		fmt.Println("Upgrade: ", err)
// 		return
// 	}
// 	defer c.Close()
// 	fmt.Println("Chat user connected from: ", c.RemoteAddr())

// 	Clients.Store(c.RemoteAddr(), c)

// 	for {
// 		_, message, err2 := c.ReadMessage() //ReadMessage blocks until message received
// 		if err2 != nil {
// 			fmt.Println("read:", err)
// 		}

// 		fmt.Println(string(message))

// 		if string(message) != "" {
// 			Clients.Range(func(key interface{}, value interface{}) bool {
// 				if value.(*websocket.Conn) == nil {
// 					Clients.Delete(key)
// 					return true
// 				}
// 				err = value.(*websocket.Conn).WriteMessage(1, message)
// 				if err != nil {
// 					fmt.Println("write:", err)
// 				}
// 				return true
// 			})
// 		}
// 	}
// }

//Updates Map
var Updates sync.Map
var UpdatesString string
var NumberOfPlayers int

func main() {
	go getSyncMapReadyForSending(&Updates)

	// Taking the address
	ipaddr, err := ioutil.ReadFile("../ip")
	if err != nil {
		log.Fatal(err)
	}

	var ipa0, ipa1, ipa2, ipa3 int
	if _, err := fmt.Sscanf(string(ipaddr), "%d.%d.%d.%d", &ipa0, &ipa1, &ipa2, &ipa3); err == nil {
		if ipa0 == 127 && ipa1 == 0 && ipa2 == 0 && ipa3 == 1 {
			fmt.Printf("Detected a localhost IP Address in /ip file! (127.0.0.1).\nChange it to the machine's address or WebRTC won't work!\n")
			return
		}

		setupWRTCServer(ipa0, ipa1, ipa2, ipa3)
		// fmt.Printf("IPv4 Found: %d.%d.%d.%d\n", ipa0, ipa1, ipa2, ipa3)
	} else {
		fmt.Printf("Couldn't find an IPv4 Address in /ip.\nCan't use webrtc connection, defaulting to websockets.\n")
		setupWSServer()
	}

	http.HandleFunc("/nicknamecheck", nicknamecheck)

	fileServer := http.FileServer(http.Dir("../"))
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
