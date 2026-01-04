#!/bin/bash

# Voix-IA Quick Setup Script
# This script helps you set up the AI receptionist system quickly

set -e

echo "🎙️  Voix-IA Quick Setup"
echo "====================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "✅ Build successful!"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo ""
    echo "📝 Please edit .env file and add your credentials:"
    echo "   - TWILIO_ACCOUNT_SID"
    echo "   - TWILIO_AUTH_TOKEN"
    echo "   - TWILIO_PHONE_NUMBER"
    echo "   - OPENAI_API_KEY"
    echo ""
    echo "Run this command to edit: nano .env"
    echo ""
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your API credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Use ngrok to expose your local server: 'ngrok http 3000'"
echo "4. Configure Twilio webhooks with your ngrok URL"
echo ""
echo "For more information, see README.md and DEPLOYMENT.md"
