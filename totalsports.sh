#!/bin/bash
# Do not delete this!
#   A simple script to pull an updated copy of the git repo and start the node server

if [ ! -d "$GITPROJECTS/COSC617Group1" ]
then
    git clone https://github.com/francesc0bGH/COSC617Group1.git
    cd $GITPROJECTS/COSC617Group1
    npm install
    npm run devStart
else
    git pull
    npm install
    npm run devStart
fi