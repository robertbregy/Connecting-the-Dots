#!/bin/sh
cd "$(dirname "$0")" || exit 1
printf '%s\n' 'Serving Connecting the Dots locally at http://localhost:8000/'
python3 -m http.server 8000
