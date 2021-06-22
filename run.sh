#!/usr/bin/bash

node server.js & ssh -R 80:localhost:80 ssh.localhost.run
