#!/bin/bash

# This script updates local Playwright screenshots with the latest ones from a GitHub Actions run.
# It requires the GitHub CLI ('gh') to be installed and authenticated.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
WORKFLOW_NAME="app.yml"
ARTIFACT_NAME="test-results"
SCREENSHOTS_DIR="tests/screenshots"

# --- Logic ---

echo "🔍 Finding current git branch..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ -z "$BRANCH" ]; then
    echo "❌ Could not determine git branch. Are you in a git repository?"
    exit 1
fi
echo "✅ On branch: $BRANCH"

echo "🔍 Finding latest run for workflow '$WORKFLOW_NAME' on branch '$BRANCH'..."
RUN_ID=$(gh run list --workflow "$WORKFLOW_NAME" --branch "$BRANCH" --limit 1 --json databaseId --jq '.[0].databaseId')

if [ -z "$RUN_ID" ] || [ "$RUN_ID" == "null" ]; then
  echo "❌ No completed runs found for branch '$BRANCH' in workflow '$WORKFLOW_NAME'."
  exit 1
fi
echo "✅ Found latest run with ID: $RUN_ID"


TEMP_DIR=$(mktemp -d)
# Cleanup the temp directory on script exit
trap 'rm -rf -- "$TEMP_DIR"' EXIT

echo "📥 Downloading artifact '$ARTIFACT_NAME' from run $RUN_ID..."
gh run download "$RUN_ID" -n "$ARTIFACT_NAME" -D "$TEMP_DIR"
echo "✅ Artifact downloaded to $TEMP_DIR"


echo "🔄 Updating local screenshots..."

# Find all the '*-actual.png' files in the downloaded artifact directory.
find "$TEMP_DIR" -name "*-actual.png" | while read -r actual_file; do
  # actual_file is e.g. /tmp/xyz/itinerary-Itinerary-should-create-accommodation-desktop/Itinerary-should-create-accommodation-1-actual.png

  dir_name=$(basename "$(dirname "$actual_file")")
  # dir_name is e.g. itinerary-Itinerary-should-create-accommodation-desktop

  file_name_no_ext=$(basename "$actual_file" -actual.png)
  # file_name_no_ext is e.g. Itinerary-should-create-accommodation-1

  spec_prefix=$(echo "$dir_name" | cut -d'-' -f1)
  # spec_prefix is e.g. 'itinerary'

  project=${dir_name##*-}
  # project is e.g. 'desktop'

  # Construct the destination directory for the snapshot
  dest_dir="$SCREENSHOTS_DIR/${spec_prefix}.spec.ts-snapshots"

  # Construct the new filename for the snapshot
  new_filename="${file_name_no_ext}-${project}-linux.png"

  dest_path="${dest_dir}/${new_filename}"

  if [ -d "$dest_dir" ]; then
    echo "  - Copying to $dest_path"
    # Ensure the destination directory exists (it should, but just in case)
    mkdir -p "$dest_dir"
    cp "$actual_file" "$dest_path"
  else
    echo "  - ⚠️ Warning: Could not find matching snapshot directory for '$spec_prefix'. Skipping file: $actual_file"
  fi
done

echo "✅ Screenshot update complete."
