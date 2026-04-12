#!/bin/bash
# Quick Start Script for Smart Campus Event Management System

echo "======================================"
echo " Smart Campus Event Management System"
echo "======================================"
echo ""

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required. Install from https://python.org"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v mysql >/dev/null 2>&1 || { echo "⚠️  MySQL not found in PATH. Make sure MySQL is running."; }

echo "✅ Prerequisites checked"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "✅ Virtual environment created"
fi
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
pip install -r requirements.txt -q
echo "✅ Backend dependencies installed"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "⚠️  Created .env from example. Please edit backend/.env with your DB credentials."
fi
cd ..

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend
npm install --silent
echo "✅ Frontend dependencies installed"
cd ..

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. Edit backend/.env with your MySQL credentials"
echo "  2. Run: mysql -u root -p < database/schema.sql"
echo "  3. Start backend:  cd backend && source venv/bin/activate && python app.py"
echo "  4. Start frontend: cd frontend && npm start"
echo ""
echo "Demo login: student@demo.com / demo123"
echo "           organizer@demo.com / demo123"
echo "           admin@demo.com / demo123"
