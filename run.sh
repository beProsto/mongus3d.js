#!/usr/bin/bash

node server.js & ssh -R 80:localhost:7080 ssh.localhost.run
