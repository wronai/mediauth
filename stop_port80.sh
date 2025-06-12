#!/bin/bash

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Find and kill the process using port 80
echo "Looking for processes using port 80..."
PID=$(lsof -ti :80 -sTCP:LISTEN)

if [ -z "$PID" ]; then
    echo "No process found running on port 80"
    exit 0
fi

echo "Found process(es) using port 80 with PID(s): $PID"
kill -9 $PID

echo "Successfully stopped process(es) on port 80"
