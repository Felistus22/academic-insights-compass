#!/bin/bash

# Padre Pio Report Card - Setup Script
echo "🚀 Setting up Padre Pio Report Card..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📄 Creating .env.local file..."
    cat > .env.local << EOL
# Supabase Configuration (already configured in the app)
# VITE_SUPABASE_URL=https://ljckqlfoptkahyrdmpml.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key_here

# The app is already configured with the necessary Supabase credentials
# No additional environment variables are needed for basic functionality
EOL
    echo "✅ .env.local file created"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To build for production:"
echo "  npm run build"
echo ""
echo "To preview production build:"
echo "  npm run preview"
echo ""
echo "The app will be available at: http://localhost:8080"
echo ""
echo "📱 PWA Features:"
echo "  - Installable on desktop and mobile"
echo "  - Offline functionality"
echo "  - Service worker for caching"
echo ""