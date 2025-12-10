#!/bin/bash

# ===============================================================
# Quick Start Script for Mela SIM Sell Portal
# This script helps you set up and run the portal
# ===============================================================

echo "======================================"
echo "Mela SIM Sell Portal - Quick Start"
echo "======================================"
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
echo "✓ Dependencies installed"

# Create logs directory
mkdir -p logs
echo "✓ Logs directory created"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Creating from template..."
    cp .env.example .env
    echo "✓ Please edit .env file with your database credentials"
fi

# Display instructions
echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Deploy the database table using: ./database/deploy_table.sh"
echo "3. Run the application: python app.py"
echo ""
echo "The portal will be available at: http://localhost:5000"
echo ""
