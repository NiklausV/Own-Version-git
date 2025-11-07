# MyGit - Custom Git Implementation + Visual Diff Viewer

A full-stack project that implements core Git functionality from scratch with a React-based visual diff viewer.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

[Layered Architecture Diagram](https://docs.google.com/document/d/1QCM6OeMi4ml-Tp-e5Qkd9h3nuNSNO5dHq5l_GPZUHIc/edit?usp=sharing)


## Features

### Git CLI Implementation
- `init` - Initialize a new repository
- `add` - Stage files for commit
- `commit` - Create snapshots with metadata
- `log` - View commit history
- `status` - Check repository state
- `diff` - Compare file changes
- `checkout` - Switch between commits (coming soon)
- `branch` - Branch management (coming soon)

### Visual Diff Viewer
- Interactive commit history timeline
- Side-by-side diff view with syntax highlighting
- Dark/Light mode toggle
- File tree navigation
- Line-by-line change tracking
- GitHub-style UI/UX

## Architecture

┌─────────────────────────────────────┐
│         Frontend (React)            │
│   - Vite + React 18                 │
│   - Tailwind CSS                    │
│   - Lucide Icons                    │
└──────────────┬──────────────────────┘
               │
               ↓ REST API
┌─────────────────────────────────────┐
│       Backend (Node.js)             │
│   - Express.js                      │
│   - Custom Git Implementation       │
│   - File-based Storage              │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│      Storage (.mygit)               │
│   - Git-compatible format           │
│   - Objects, Refs, Trees            │
│   - SHA-1 hashing                   │
└─────────────────────────────────────┘

### Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd own-version-.git
```

2. **Install all dependencies**
```bash
npm run install:all
```

Or install individually:
```bash
# Install CLI dependencies
cd cli-tool && npm install

# Install API dependencies
cd ../api && npm install

# Install frontend dependencies
cd ../diff-viewer && npm install
```

### Running the Project

#### Option 1: Run Everything Together
```bash
npm run dev
```
This starts both the API server and the React dev server concurrently.

#### Option 2: Run Components Separately

**Terminal 1 - Start API Server:**
```bash
cd api
npm run dev
```
Server runs on `http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
cd diff-viewer
npm run dev
```
UI runs on `http://localhost:5173`

**Terminal 3 - Use CLI Tool:**
```bash
# Install CLI globally
cd cli-tool
npm install -g .

```

## CLI Usage

### Initialize a Repository
```bash
mygit init
```

### Stage Files
```bash
mygit add file1.js file2.js
mygit add .  # Add all files
```

### Create a Commit
```bash
mygit commit -m "Add new feature"
```

### View Commit History
```bash
mygit log
mygit log -n 5  # Show last 5 commits
```

### Check Status
```bash
mygit status
```

### View Differences
```bash
mygit diff  # Compare working tree with staging
mygit diff commit1 commit2  # Compare two commits
```

## API Endpoints

### Get All Commits
```
GET /api/commits?limit=50
```

### Get Specific Commit
```
GET /api/commits/:hash
```

### Get Diff Between Commits
```
GET /api/diff/:hash1/:hash2
```

### Get Status
```
GET /api/status
```

## Frontend Integration

Connect your React app to the API:

```javascript
// src/services/api.js
const API_URL = 'http://localhost:3001/api';

export async function getCommits(limit = 50) {
  const response = await fetch(`${API_URL}/commits?limit=${limit}`);
  return response.json();
}

export async function getCommit(hash) {
  const response = await fetch(`${API_URL}/commits/${hash}`);
  return response.json();
}

export async function getDiff(hash1, hash2) {
  const response = await fetch(`${API_URL}/diff/${hash1}/${hash2}`);
  return response.json();
}
```

## How It Works

### Git Internals

1. **Objects Storage**: Files are stored as content-addressable blobs using SHA-1 hashing
2. **Trees**: Directories are represented as tree objects linking to blobs
3. **Commits**: Snapshots that point to a tree and contain metadata
4. **Staging Area**: Index file tracks files ready to be committed
5. **References**: HEAD and branch refs point to specific commits

### Storage Structure
```
.mygit/
├── objects/           # Content-addressable storage
│   ├── ab/
│   │   └── cdef123... # Object files (first 2 chars as dir)
├── refs/
│   └── heads/
│       └── main       # Branch reference
├── HEAD               # Points to current branch
├── index              # Staging area
└── config             # Repository config
```

## Technology Stack
Frontend

React 18 - UI framework
Vite - Build tool
Tailwind CSS - Styling
Lucide React - Icons
diff - Diff algorithm

Backend

Node.js 18+ - Runtime
Express.js - Web framework
SHA-1 - Hashing (crypto module)
File System - Native storage

CLI

Commander.js - CLI framework
Chalk - Terminal styling

## Roadmap

### Core Git Functionality 
- [x] Repository initialization
- [x] File staging (add)
- [x] Creating commits
- [x] Commit history (log)
- [x] Repository status
- [x] Basic diff
- [x] Checkout commits
- [x] Branch creation and switching

### Enhanced UI 
- [x] Syntax highlighting in diffs
- [x] File tree explorer
- [x] Commit graph visualization
- [x] Search functionality
- [x] Keyboard shortcuts


## License

MIT License - feel free to use this project for learning and portfolio purposes.

## Acknowledgments

- Inspired by [CodeCrafters Git Challenge](https://codecrafters.io)
- Diff algorithm based on [diff-match-patch](https://github.com/google/diff-match-patch)
- UI inspired by GitHub and VS Code

## Contact

Mustafa Hadi - mustafahadi053@gmail.com

**Built as a portfolio project demonstrating:**
- Systems programming (Git internals)
- CLI tool development
- REST API design
- Modern React development
- Full-stack integration
