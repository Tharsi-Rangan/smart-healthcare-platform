#!/bin/bash

# Telemedicine Service - Quick Setup Script
# Run this to install all Twilio dependencies

echo "🔧 Installing Twilio Telemedicine Service Dependencies..."

# Install backend Twilio package
echo "📦 Installing Twilio SDK in consultation-service..."
cd services/consultation-service
npm install twilio
cd ../..

# Install frontend Twilio Video SDK
echo "📦 Installing Twilio Video SDK in frontend..."
cd frontend
npm install twilio-video
cd ..

echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add Twilio credentials to services/consultation-service/.env:"
echo "   TWILIO_ACCOUNT_SID=your_account_sid"
echo "   TWILIO_AUTH_TOKEN=your_auth_token"
echo "   TWILIO_API_KEY=your_api_key"
echo "   TWILIO_API_SECRET=your_api_secret"
echo ""
echo "2. Start the consultation service:"
echo "   cd services/consultation-service && npm start"
echo ""
echo "3. Start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "📖 For detailed setup: see TELEMEDICINE_SETUP.md"
