#!/usr/bin/env bash

# determine this files directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# set default value of config
if [ -z $1 ]
    then
        CMD="run prepublish"
else
    CMD="$1 $2"
fi

docker run \
    --rm \
    -t \
    -i \
    --name universal-route-npm \
    -v "$DIR/..":/app \
    opinephp/npm \
    $CMD
