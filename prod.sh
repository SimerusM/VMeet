#!/bin/bash

export REACT_APP_API_URL="https://vmeet.duckdns.org"

(cd client && rm -rf build && npm run build)

COMPOSE_COMMAND="-f docker-compose.prod.yml up --build -d"

if command -v docker-compose &> /dev/null; then
    docker-compose $COMPOSE_COMMAND "$@"
elif command -v docker compose &> /dev/null; then
    docker compose $COMPOSE_COMMAND "$@"
else
    echo "Error: Neither 'docker-compose' nor 'docker compose' is installed."
    exit 1
fi