#!/usr/bin/env bash

cd /app

# run npm
runuser -s /bin/bash www-data -c "npm $1 $2"
