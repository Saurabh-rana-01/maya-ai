#!/bin/bash
echo "===================================================================="
echo " * Maya AI - Executive Email Management Dashboard"
echo " * AI Full-Stack Engineer Intern Assignment Prototype"
echo "===================================================================="
echo ""
echo "Starting Maya AI Backend Server on port 5000..."
echo ""

# Open browser if possible
if which xdg-open > /dev/null; then
  (sleep 2 && xdg-open http://localhost:5000) &
elif which open > /dev/null; then
  (sleep 2 && open http://localhost:5000) &
fi

node server/server.js
