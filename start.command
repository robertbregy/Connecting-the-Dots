#!/bin/bash
cd "$(dirname "$0")"
PORT=${1:-8000}
URL="http://127.0.0.1:${PORT}"
(sleep 1; open "$URL") &
python3 -m http.server "$PORT" --bind 127.0.0.1
