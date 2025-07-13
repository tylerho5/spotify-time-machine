#!/bin/bash

# Development startup script for Spotify Time Machine

echo "🎵 Starting Spotify Time Machine Development Servers..."

# Check if config.ini exists
if [ ! -f "config/config.ini" ]; then
    echo "❌ config/config.ini not found! Please copy config/config.ini.template and add your Spotify credentials."
    exit 1
fi

# Start backend in background
echo "🚀 Starting Flask backend on port 8888..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🚀 Starting React frontend on port 3000..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8888"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for background processes
wait
