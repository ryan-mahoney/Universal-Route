#!/usr/bin/env bash

cd /app

# allow www-data to write node_modules and dist
chown www-data /app/dist -R
chown www-data /app/node_modules -R

# run npm
runuser -s /bin/bash www-data -c "npm $1 $2"
