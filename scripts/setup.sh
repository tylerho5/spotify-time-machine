#!/bin/bash

# React TypeScript Spotify Time Machine Setup Script

echo "🎵 Setting up Spotify Time Machine React TypeScript project..."

# Install Node.js dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Create Python virtual environment for backend
echo "🐍 Setting up Python backend environment..."
cd backend
python3 -m venv venv

# Activate virtual environment and install dependencies
echo "📚 Installing backend dependencies..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Unix/Linux/macOS
    source venv/bin/activate
fi

pip install -r requirements.txt
cd ..

# Check if config.ini exists
if [ ! -f "config/config.ini" ]; then
    echo "⚙️  Creating config.ini from template..."
    cp config/config.ini.template config/config.ini
    echo "🔧 Please edit config/config.ini with your Spotify API credentials!"
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit config/config.ini with your Spotify API credentials"
echo "2. Add your Spotify data files to data/StreamingHistoryJSONS/ folder"
echo "3. Run 'npm run backend' in one terminal"
echo "4. Run 'npm run dev' in another terminal"
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "🚀 Happy listening!"
