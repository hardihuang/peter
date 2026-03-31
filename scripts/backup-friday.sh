#!/bin/bash

# Friday Backup Script
# Backs up .openclaw folder to GitHub every 2 weeks
# Keeps only 2 most recent backups

set -e

BACKUP_REPO="/home/admin/.openclaw/workspace/peter"
SOURCE_DIR="/home/admin/.openclaw"
BACKUP_BASE="$BACKUP_REPO/friday-backups"
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="$BACKUP_BASE/$DATE"

echo "Starting Friday backup..."
echo "Date: $DATE"
echo "Source: $SOURCE_DIR"
echo "Destination: $BACKUP_DIR"

# Create backup base directory if it doesn't exist
mkdir -p "$BACKUP_BASE"

# Create new backup directory
mkdir -p "$BACKUP_DIR"

# Copy everything from .openclaw to backup (excluding git repos and large files)
# Using cp -r since rsync may not be available
# Exclude workspace folder to avoid git submodule issues
for item in "$SOURCE_DIR"/*; do
    basename_item=$(basename "$item")
    if [ "$basename_item" != "workspace" ]; then
        cp -r "$item" "$BACKUP_DIR/" 2>/dev/null || true
    fi
done

# Remove excluded directories after copy
rm -rf "$BACKUP_DIR"/.git 2>/dev/null || true
find "$BACKUP_DIR" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find "$BACKUP_DIR" -name "*.log" -delete 2>/dev/null || true

echo "Backup completed: $BACKUP_DIR"

# Clean up old backups - keep only 2 most recent
cd "$BACKUP_BASE"
BACKUP_COUNT=$(ls -1d */ 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt 2 ]; then
    echo "Found $BACKUP_COUNT backups, cleaning up old ones..."
    # List directories sorted by name (oldest first), skip the last 2, remove the rest
    ls -1d */ | sort | head -n -2 | while read dir; do
        echo "Removing old backup: $dir"
        rm -rf "$dir"
    done
fi

# Show current backups
echo "Current backups:"
ls -la "$BACKUP_BASE"

# Commit and push to GitHub (excluding backup folder to avoid recursion)
cd "$BACKUP_REPO"
git add -A -- ':!friday-backups/*'
git commit -m "Backup: Friday data as of $DATE" || echo "Nothing to commit"
git push origin main

echo "Backup pushed to GitHub successfully!"
