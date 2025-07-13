# Directory Structure Update

The project has been reorganized for better maintainability. Here's what changed:

## New Structure

```
spotify-time-machine/
├── backend/                         # Flask API backend
├── config/                          # All configuration files
│   ├── frontend/                   # Frontend build configuration
│   │   ├── postcss.config.js      # PostCSS configuration
│   │   ├── tailwind.config.js     # Tailwind CSS configuration
│   │   ├── tsconfig.json          # TypeScript configuration
│   │   ├── tsconfig.node.json     # TypeScript Node configuration
│   │   └── vite.config.ts          # Vite build configuration
│   ├── config.ini                  # Spotify API credentials
│   └── config.ini.template         # Configuration template
├── data/                           # Data and cache files
│   ├── cache/                      # Cache directory
│   │   ├── .spotify_cache          # OAuth token cache
│   │   └── track_cache.json        # Cached track IDs
│   └── StreamingHistoryJSONS/      # Your Spotify streaming history files
├── docs/                           # Documentation
├── scripts/                        # Setup and utility scripts
├── src/                           # React frontend source
├── index.html                     # Main HTML file
└── package.json                   # Node.js dependencies
```

## Benefits

1. **Cleaner root directory** - Configuration files are organized in the `config/` folder
2. **Separated data** - All data and cache files are in the `data/` folder
3. **Better organization** - Frontend configuration is separate from backend configuration
4. **Easier maintenance** - Related files are grouped together

## Migration

If you have an existing installation, run the migration script:

```bash
./scripts/migrate-structure.sh
```

This script will automatically move files to their new locations and update the necessary configuration references.
