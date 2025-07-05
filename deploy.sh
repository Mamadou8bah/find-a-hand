#!/bin/bash

# Find-A-Hand Deployment Script
echo "🚀 Starting Find-A-Hand deployment process..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with the following variables:"
    echo "MONGO_URI=your_mongodb_connection_string"
    echo "JWT_SECRET=your_jwt_secret"
    echo "NODE_ENV=production"
    echo "PORT=5000"
    exit 1
fi

# Check if all required files exist
echo "📋 Checking required files..."
required_files=("package.json" "server.js" "app.js" "README.md" "DEPLOYMENT.md")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo "✅ All required files found"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Test the application
echo "🧪 Testing application..."
npm start &
APP_PID=$!

# Wait for app to start
sleep 5

# Test health endpoint
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Application is running successfully"
else
    echo "❌ Application failed to start"
    kill $APP_PID
    exit 1
fi

# Stop the test server
kill $APP_PID

echo "🎉 Application is ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy backend to Railway/Render:"
echo "   - Follow instructions in DEPLOYMENT.md"
echo ""
echo "3. Deploy frontend to Netlify/Vercel:"
echo "   - Follow instructions in DEPLOYMENT.md"
echo ""
echo "4. Update API URL in frontend/views/config.js"
echo "   - Replace 'https://find-a-hand-backend.onrender.com' with your actual backend URL"
echo ""
echo "5. Test the deployed application"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md" 