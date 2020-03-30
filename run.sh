#!/usr/bin/bash

node server.js & ssh -R 80:localhost:8080 ssh.localhost.run
