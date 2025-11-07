# Git Clone + Visual Diff Viewer - Project Structure

## Folder Structure

```
own-version-git/
├── node_modules/
├── README.md
├── PROJECT_STRUCTURE.md
├── QUICK_REFERENCE.md
├── SETUP_GUIDE.md
├── setup.sh
├── .gitignore
├── package.json (root - for managing both projects)
│
├── cli-tool/                    # Git clone implementation
│   ├── node_modules/
│   ├── package.json
│   ├── src/
│      ├── index.js            # CLI entry point
│      ├── commands/
│      │   ├── init.js
│      │   ├── add.js
│      │   ├── commit.js
│      │   ├── log.js
│      │   ├── status.js
│      │   ├── diff.js
│      │   └── checkout.js
│      │   └── branch.js
│      ├── core/
│      │   ├── objects.js      # Blob/tree handling
│      │   ├── hash.js         # SHA-1 hashing
│      │   ├── staging.js      # Index management
│      │   └── refs.js         # HEAD and branch refs
│      │   └── constants.js
│      └── utils/
│          ├── fileSystem.js
│          ├── findRepoRoot.js #Find .mygit folder in any location inside the project
│          └── logger.js
│   
├── test-repo/
│ └── .mygit/                  # Created by init command
│       ├── objects/
│       ├── refs/
│       ├── HEAD
│       └── index
│
├── api/                         # Bridge between CLI and UI
│   ├── node_modules/
│   ├── package.json
│   ├── core/
│   │   ├── hash.js
│   │   ├── objects.js
│   │   ├── staging.js
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   │   ├── commits.js
│   │   │   ├── branches.js
│   │   │   └── diff.js
│   │   │   └── files.js
│   │   └── utils/
│   │       └── gitParser.js
│   └── .env
│
└── diff-viewer/                 # React frontend
│   ├── node_modules/
    ├── package.json
    ├── vite.config.js (or next.config.js)
    ├── public/
    ├── src/
    │   ├── App.jsx
    │   ├── index.css 
    │   ├── main.jsx
    │   ├── components/
    │   │   ├── CommitHistory.jsx
    │   │   ├── BranchSelector.jsx
    │   │   ├── DiffViewer.jsx
    │   │   ├── FileContentViewer.jsx
    │   │   ├── FileDiff.jsx
    │   │   ├── FileTree.jsx
    │   │   └── CodeBlock.jsx
    │   │   └── FileEditor.jsx
    │   ├── hooks/
    │   │   ├── useCommits.js
    │   │   └── useDiff.js
    │   ├── services/
    │   │   └── api.js
    │   ├── utils/
    │       ├── diffParser.js
    │       └── highlighter.js
    │   
    ├── .env
    ├── eslint.config.js
    ├── postcss.config.js
    ├── tailwind.config.js
    └── index.html    
```

## Quick Start Steps

### 1. Initialize Root Package
```bash
npm init -y
npm install -D concurrently nodemon
```

### 2. Set Up CLI Tool
```bash
cd cli-tool
npm init -y
npm install commander chalk ora
npm install -D @types/node
```

### 3. Set Up API Server
```bash
cd api
npm init -y
npm install express cors dotenv
npm install -D nodemon
```

### 4. Set Up Frontend
```bash
cd diff-viewer
npm create vite@latest . -- --template react
npm install axios diff-match-patch react-diff-view tailwindcss
npx tailwindcss init
```

## Next Steps

1. **Phase 1**: Implement core Git commands in `cli-tool/`
2. **Phase 2**: Create API endpoints in `api/`
3. **Phase 3**: Build React UI in `diff-viewer/`
4. **Phase 4**: Polish and integrate

## Scripts

Add to root `package.json`:
```json
{
  "scripts": {
    "cli": "cd cli-tool && npm start",
    "api": "cd api && npm run dev",
    "ui": "cd diff-viewer && npm run dev",
    "dev": "concurrently \"npm run api\" \"npm run ui\"",
    "install-all": "npm install && cd cli-tool && npm install && cd ../api && npm install && cd ../diff-viewer && npm install"
  }
}
```

## Status
- Main folder created
- App folder with app.py
- Need to set up complete structure
- Implement Git core functionality
- Build API bridge
- Create React UI