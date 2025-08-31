@echo off
REM Fruit & Juice Shop Management App Setup Script for Windows
REM This script will set up the application environment

echo 🍎 Fruit & Juice Shop Management App Setup
echo ==========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.7 or higher.
    pause
    exit /b 1
)

echo ✅ Python detected

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo 📋 Installing required packages...
pip install -r requirements.txt

echo.
echo 🎉 Setup completed successfully!
echo.
echo To run the application:
echo 1. Activate the virtual environment: venv\Scripts\activate.bat
echo 2. Run the application: python run.py
echo 3. Open your browser and go to: http://localhost:5000
echo.
echo Happy managing! 🍊🥝🍌
pause