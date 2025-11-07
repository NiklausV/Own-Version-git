# MyGit Quick Reference

## CLI Commands Cheat Sheet

### Basic Operations
```bash
mygit init                          # Initialize repository
mygit add <files...>                # Stage files
mygit add .                         # Stage all files
mygit commit -m "message"           # Create commit
mygit log                           # Show history
mygit log -n 5                      # Show last 5 commits
mygit status                        # Show status
```

### Diff Operations
```bash
mygit diff                          # Working tree vs staging
mygit diff <hash1> <hash2>          # Compare commits
```

### Branch Operations
```bash
mygit branch                        # List branches
mygit branch feature-x              # Create branch
mygit branch -d feature-x           # Delete branch
```

### Checkout Operations
```bash
mygit checkout main                 # Switch to branch
mygit checkout -b feature           # Create and switch
mygit checkout abc1234              # Checkout commit (detached)
```

## API Endpoints

### Commits
- `GET /api/commits?limit=50` - List commits
- `GET /api/commits/:hash` - Get commit details
- `GET /api/commits/:hash/files` - Get commit files

### Diffs
- `GET /api/diff/:hash1/:hash2` - Compare commits
- `GET /api/diff/:hash/:file` - Get file content

### Repository
- `GET /api/status` - Get repo status
- `GET /api/branches` - List branches
- `GET /health` - Health check

## ⌨Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `⌘K` / `Ctrl+K` | Open search | Global |
| `⌘R` / `Ctrl+R` | Refresh | Global |
| `T` | Toggle file tree | When not in input |
| `↑` | Previous commit | When not in input |
| `↓` | Next commit | When not in input |

## Common Workflows

### Starting a New Project
```bash
mygit init
echo "# My Project" > README.md
mygit add README.md
mygit commit -m "Initial commit"
```

### Creating a Feature Branch
```bash
mygit checkout -b feature-login
# ... make changes ...
mygit add .
mygit commit -m "Add login feature"
mygit checkout main
```

### Viewing Changes
```bash
# See what's changed
mygit status

# See differences
mygit diff

# View history
mygit log
```

### Branch Management
```bash
# Create branch from current commit
mygit branch hotfix

# Switch to branch
mygit checkout hotfix

# Work and commit
mygit add bugfix.js
mygit commit -m "Fix critical bug"

# Switch back
mygit checkout main

# Clean up
mygit branch -d hotfix
```

## UI 

### Search
- Click search bar or press `⌘K`
- Type commit message, author, or hash
- Results filter in real-time

### File Tree
- Click folders to expand/collapse
- Click files to view diff
- Press `T` to toggle visibility

### Commit Navigation
- Click commits in sidebar
- Use arrow keys for quick navigation
- Search to filter commits

### Diff Viewing
- File tabs for quick switching
- Line-by-line changes
- Color-coded additions/deletions

## Diff Statistics

In the header, you'll see:
- **Files changed**: Number of modified files
- **+Additions**: Lines added (green)
- **-Deletions**: Lines removed (red)

## Search Syntax

Search finds matches in:
- Commit messages
- Author names
- Commit hashes

Examples:
- `"initial"` - Finds commits with "initial" in message
- `"john"` - Finds commits by John
- `"abc123"` - Finds commit with hash starting with abc123

## UI Components

### Commit History (Left Sidebar)
- Avatar with initials
- Commit message
- Short hash
- Author and date
- Current selection highlighted

### File Tree (Middle Panel)
- Hierarchical folder structure
- Expandable folders
- File icons
- Selection state

### Diff Viewer (Main Area)
- File selector tabs
- Status badges (Added/Modified/Deleted)
- Line numbers
- Syntax highlighting
- Color-coded changes

## Indicators

### Commit Status
- Green = Current HEAD
- Blue = Selected commit
- White = Other commits

### File Status
- Green = Added
- Yellow = Modified
- Red = Deleted

### Branch Status
- `* main` - Current branch (green)
- `  feature` - Other branch (white)
- `HEAD (detached)` - Detached HEAD state

## Tips & Tricks

### CLI
1. Use tab completion for file names
2. Use `-n` flag with log to limit results
3. Commit hashes can be abbreviated (first 7 chars)
4. Use `mygit branch` to see current branch

### UI
1. Use keyboard shortcuts for faster navigation
2. Search is case-insensitive
3. File tree remembers expanded state
4. Diff stats update automatically
5. Click refresh to see new commits

## Configuration

### Environment Variables

**API** (`.env`):
```env
PORT=3001
MYGIT_PATH=../.mygit
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
```


## Quick Start 

```bash
# Setup
npm run install-all
cd api && cp .env.example .env && cd ..
cd diff-viewer && cp .env.example .env && cd ..

# Create sample repo
npm run cli init
echo "test" > test.txt
npm run cli add test.txt
npm run cli commit -m "Initial commit"

# Start UI
npm run dev

# Open http://localhost:5173
```

## Quick Fixes

### No commits showing?
```bash
npm run cli log  # Verify commits exist
```

### API not connecting?
```bash
curl http://localhost:3001/health  # Check API is running
```

### Keyboard shortcuts not working?
- Make sure you're not in an input field
- Check browser console for errors

### File tree not visible?
- Press `T` to toggle
- Check if commit has files

---

**Need more help?** Check `SETUP_GUIDE.md` for detailed instructions.