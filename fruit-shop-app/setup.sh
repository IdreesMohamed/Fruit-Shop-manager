#!/bin/bash

# Fruit & Juice Shop Management App Setup Script
# This script will set up the application environment

echo "🍎 Fruit & Juice Shop Management App Setup"
echo "=========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

# Check Python version
python_version=$(python3 -c "import sys; print(sys.version_info.major, sys.version_info.minor)")
IFS=' ' read -r major minor <<< "$python_version"

if [[ $major -lt 3 ]] || [[ $major -eq 3 && $minor -lt 7 ]]; then
    echo "❌ Python 3.7 or higher is required. Current version: $major.$minor"
    exit 1
fi

echo "✅ Python $major.$minor detected"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📋 Installing required packages..."
pip install -r requirements.txt

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To run the application:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Run the application: python run.py"
echo "3. Open your browser and go to: http://localhost:5000"
echo ""
echo "Happy managing! 🍊🥝🍌"