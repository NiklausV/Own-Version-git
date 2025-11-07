#!/bin/bash
# setup.sh - Quick setup script for MyGit project

set -e  # Exit on error

echo "MyGit Project Setup"
echo "======================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"

# Create directory structure
echo ""
echo "Creating project structure..."

mkdir -p cli-tool/src/{commands,core,utils}
mkdir -p api/src/{routes,utils}
mkdir -p diff-viewer/src/{components,hooks,services,utils,styles}
mkdir -p diff-viewer/public

echo -e "${GREEN}✓ Directory structure created${NC}"

# Create package.json files
echo ""
echo "Creating package.json files..."

# Root package.json
cat > package.json << 'EOF'
{
  "name": "own-version-git",
  "version": "1.0.0",
  "description": "Full-stack Git clone with visual diff viewer",
  "private": true,
  "scripts": {
    "install-all": "npm install && cd cli-tool && npm install && cd ../api && npm install && cd ../diff-viewer && npm install",
    "cli": "cd cli-tool && npm start",
    "api": "cd api && npm run dev",
    "ui": "cd diff-viewer && npm run dev",
    "dev": "concurrently \"npm run api\" \"npm run ui\"",
    "start": "npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "keywords": ["git", "version-control", "diff-viewer", "full-stack"],
  "author": "Your Name",
  "license": "MIT"
}
EOF

# CLI package.json
cat > cli-tool/package.json << 'EOF'
{
  "name": "mygit-cli",
  "version": "1.0.0",
  "type": "module",
  "description": "Custom Git implementation",
  "main": "src/index.js",
  "bin": {
    "mygit": "./src/index.js"
  },
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "chalk": "^5.3.0",
    "commander": "^11.1.0",
    "ora": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# API package.json
cat > api/package.json << 'EOF'
{
  "name": "mygit-api",
  "version": "1.0.0",
  "type": "module",
  "description": "API server for MyGit",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

echo -e "${GREEN}✓ Package files created${NC}"

# Create .gitignore
echo ""
echo "🔒 Creating .gitignore..."

cat > .gitignore << 'EOF'
node_modules/
.mygit/
.env
.DS_Store
dist/
build/
logs/
*.log
.idea/
.vscode/
EOF

echo -e "${GREEN}✓ .gitignore created${NC}"

# Install dependencies
echo ""
echo "Installing dependencies..."
echo ""

# Root dependencies
echo "Installing root dependencies..."
npm install

# CLI dependencies
echo "Installing CLI dependencies..."
cd cli-tool && npm install && cd ..

# API dependencies
echo "Installing API dependencies..."
cd api && npm install && cd ..

# Frontend dependencies (will be created separately)
echo -e "${YELLOW}⚠️  Frontend setup requires manual Vite initialization${NC}"
echo "Run: cd diff-viewer && npm create vite@latest . -- --template react"

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Copy the source files from the artifacts to their respective directories"
echo "2. Initialize the frontend: cd diff-viewer && npm create vite@latest . -- --template react"
echo "3. Install frontend dependencies: cd diff-viewer && npm install axios diff tailwindcss"
echo "4. Start development: npm run dev"
echo ""
echo "Quick Commands:"
echo "   npm run dev       - Start API + UI"
echo "   npm run cli       - Use CLI tool"
echo "   npm run api       - Start API server only"
echo "   npm run ui        - Start frontend only"
echo ""
echo "Documentation: See README.md for full details"
echo ""