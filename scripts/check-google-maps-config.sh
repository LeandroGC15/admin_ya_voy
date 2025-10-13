#!/bin/bash

echo "================================================"
echo "🗺️  Google Maps Configuration Checker"
echo "================================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ ERROR: .env.local file not found"
    echo ""
    echo "📝 Solution:"
    echo "   1. Create .env.local file in project root"
    echo "   2. Add: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here"
    echo "   3. See GOOGLE_MAPS_SETUP.md for detailed instructions"
    exit 1
fi

echo "✅ .env.local file exists"

# Check if API key variable is defined
if ! grep -q "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" .env.local; then
    echo "❌ ERROR: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not found in .env.local"
    echo ""
    echo "📝 Solution:"
    echo "   Add this line to .env.local:"
    echo "   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here"
    exit 1
fi

echo "✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY variable found"

# Extract API key value
KEY_LINE=$(grep "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" .env.local | head -1)
KEY_VALUE=$(echo "$KEY_LINE" | cut -d'=' -f2 | tr -d ' "'"'"'')
KEY_LENGTH=${#KEY_VALUE}

echo ""
echo "📊 API Key Analysis:"
echo "   Length: $KEY_LENGTH characters"

# Check API key length
if [ $KEY_LENGTH -lt 30 ]; then
    echo "   Status: ❌ TOO SHORT (likely a placeholder)"
    echo ""
    echo "⚠️  WARNING: Your API key is too short!"
    echo ""
    echo "📝 Solution:"
    echo "   1. Go to: https://console.cloud.google.com/apis/credentials"
    echo "   2. Create a new API key (should be ~39 characters)"
    echo "   3. Enable 'Maps JavaScript API'"
    echo "   4. Copy the FULL API key to .env.local"
    echo "   5. Restart your dev server: npm run dev"
    echo ""
    echo "📖 See GOOGLE_MAPS_SETUP.md for detailed instructions"
    exit 1
elif [ $KEY_LENGTH -gt 50 ]; then
    echo "   Status: ⚠️  TOO LONG (might include extra characters)"
    echo ""
    echo "📝 Tip: Make sure there are no quotes or spaces in your API key"
elif [ $KEY_LENGTH -ge 35 ] && [ $KEY_LENGTH -le 45 ]; then
    echo "   Status: ✅ LOOKS GOOD"
    echo ""
    echo "🎉 Configuration looks correct!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Make sure 'Maps JavaScript API' is enabled in Google Cloud Console"
    echo "   2. Restart your dev server: npm run dev"
    echo "   3. Clear browser cache (Ctrl+Shift+R)"
    echo "   4. Check browser console for any errors"
    echo ""
    echo "📖 If you still see errors, check GOOGLE_MAPS_SETUP.md"
else
    echo "   Status: ⚠️  UNUSUAL LENGTH (might work, but verify)"
    echo ""
    echo "📝 Tip: Google Maps API keys are typically 39 characters long"
fi

echo ""
echo "================================================"
echo "✅ Configuration check complete"
echo "================================================"


