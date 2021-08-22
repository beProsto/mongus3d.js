# The Amogus 3D enhanced Web Browser Chat

Hey! This project is just a little fun experiment for me, to see whether or not it is possible to create a multiplayer game in the web browser.

This project is still ongoing. You can check out what I'm trying to do currently in the `project` tab on `github` (propably).

If you'd like to see this project working yourself, you just have to write your server's IP into the `ip` file and run the `go` server (for which you need to have [go](https://golang.org/) installed), which is in the `./go_server/` directory.

1. `cd go_server`
2. `go build`
3. `./go_server`

Big shoutout to [@wawesomeNOGUI](https://github.com/wawesomeNOGUI/) for making this project possible via his great [webrtcGameTemplate](https://github.com/wawesomeNOGUI/webrtcGameTemplate) repository. :D

It's highly likely that your text editor will add an endline symbol (`\n`) to the end of your ip file adter you save it. Please make sure that it's not the case. If it is, the server will notify you upon trying to run with a panic error.
If you're using `nano`, please use the `-L` option when editing the `ip` file. It should look something like this: `nano -L ./ip`.