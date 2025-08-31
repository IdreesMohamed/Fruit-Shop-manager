#!/usr/bin/env python3
"""
Fruit & Juice Shop Management App
Simple runner script for the application
"""

import sys
import os
from app import app

if __name__ == '__main__':
    # Print startup message
    print("=" * 60)
    print("🍎 Fruit & Juice Shop Management App")
    print("=" * 60)
    print("Starting server...")
    print("App will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)