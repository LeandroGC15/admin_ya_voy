#!/bin/bash

echo "================================================"
echo "🔍 API Limits Checker - Maximum 100 items per request"
echo "================================================"
echo ""

# Check for high limit values in source code (>100)
echo "Checking for limit values > 100..."
echo ""

HIGH_LIMITS=$(grep -r "limit.*[2-9][0-9][0-9]\|limit.*1[0-9][0-9]\|limit.*200\|limit.*1000" src/ --include="*.ts" --include="*.tsx" | grep -v "limit.*100" | grep -v "max(100)" | grep -v "Math.min.*100" | wc -l)

if [ $HIGH_LIMITS -gt 0 ]; then
    echo "⚠️  WARNING: Found $HIGH_LIMITS instances of high limit values (>100)"
    echo ""
    echo "High limit values found:"
    grep -r "limit.*[2-9][0-9][0-9]\|limit.*1[0-9][0-9]\|limit.*200\|limit.*1000" src/ --include="*.ts" --include="*.tsx" | grep -v "limit.*100" | grep -v "max(100)" | grep -v "Math.min.*100"
    echo ""
    echo "📝 Note: All API requests must have limit <= 100"
    echo "   Use pagination for larger datasets"
else
    echo "✅ All limit values are within acceptable range (<=100)"
fi

echo ""
echo "================================================"
echo "✅ API limits check complete"
echo "================================================"
