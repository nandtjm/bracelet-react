#!/bin/bash

# Fixed script to download all letter images from Cloudinary
# URL pattern: https://res.cloudinary.com/drvnwq9bm/image/upload/w_915,f_auto/customizer-v2/colors/WL/A/WL-A-E-01.png

# Create directories for organizing images
mkdir -p public/images/letters/white

# Base URL components
BASE_URL="https://res.cloudinary.com/drvnwq9bm/image/upload/w_915,f_auto/customizer-v2/colors"
COLOR="WL" # White Letters
STYLE="E" # Style identifier

# Letters A-Z
declare -a LETTERS=("A" "B" "C" "D" "E" "F" "G" "H" "I" "J" "K" "L" "M" "N" "O" "P" "Q" "R" "S" "T" "U" "V" "W" "X" "Y" "Z")

# Positions 01-13 (for 2-13 character words)
declare -a POSITIONS=("01" "02" "03" "04" "05" "06" "07" "08" "09" "10" "11" "12" "13")

echo "Starting fixed download of remaining letter images..."

# Continue from where we left off (I-Z)
declare -a REMAINING_LETTERS=("I" "J" "K" "L" "M" "N" "O" "P" "Q" "R" "S" "T" "U" "V" "W" "X" "Y" "Z")

# Loop through remaining letters
for LETTER in "${REMAINING_LETTERS[@]}"; do
    echo "  Downloading letter: $LETTER"
    
    # Create letter directory
    mkdir -p "public/images/letters/white/$LETTER"
    
    # Loop through each position
    for i in "${!POSITIONS[@]}"; do
        POSITION=${POSITIONS[$i]}
        CHAR_COUNT=$((i + 2)) # Position 01 = 2 chars, 02 = 3 chars, etc.
        
        # Construct the full URL
        URL="$BASE_URL/$COLOR/$LETTER/$COLOR-$LETTER-$STYLE-$POSITION.png"
        
        # Construct the local filename (fixed logic)
        FILENAME="public/images/letters/white/$LETTER/${CHAR_COUNT}char-pos$((i + 1)).png"
        
        echo "    Position $POSITION (${CHAR_COUNT} chars) -> $FILENAME"
        
        # Download the image
        if curl -f -s -o "$FILENAME" "$URL"; then
            echo "    ✓ Downloaded: $FILENAME"
        else
            echo "    ✗ Failed: $URL"
            # Remove empty file if download failed
            rm -f "$FILENAME"
        fi
        
        # Small delay to be respectful to the server
        sleep 0.1
    done
    
    echo "  Completed letter: $LETTER"
done

echo "Download complete!"
echo "Now reorganizing existing A-H files with correct naming..."

# Fix the existing A-H files that have wrong naming
declare -a EXISTING_LETTERS=("A" "B" "C" "D" "E" "F" "G" "H")

for LETTER in "${EXISTING_LETTERS[@]}"; do
    echo "Fixing letter: $LETTER"
    
    # Remove incorrectly named files and re-download
    rm -rf "public/images/letters/white/$LETTER"
    mkdir -p "public/images/letters/white/$LETTER"
    
    for i in "${!POSITIONS[@]}"; do
        POSITION=${POSITIONS[$i]}
        CHAR_COUNT=$((i + 2)) # Position 01 = 2 chars, 02 = 3 chars, etc.
        
        # Construct the full URL
        URL="$BASE_URL/$COLOR/$LETTER/$COLOR-$LETTER-$STYLE-$POSITION.png"
        
        # Construct the local filename (correct logic)
        FILENAME="public/images/letters/white/$LETTER/${CHAR_COUNT}char-pos$((i + 1)).png"
        
        # Download the image
        if curl -f -s -o "$FILENAME" "$URL"; then
            echo "    ✓ Fixed: $FILENAME"
        else
            echo "    ✗ Failed: $URL"
            rm -f "$FILENAME"
        fi
        
        sleep 0.1
    done
done

echo ""
echo "All downloads complete!"
echo "Images organized as: public/images/letters/white/[LETTER]/[CHARCOUNT]char-pos[POSITION].png"
echo ""
echo "Example:"
echo "- 2 character word, position 1: 2char-pos1.png"
echo "- 3 character word, position 2: 3char-pos2.png"
echo "- 13 character word, position 13: 13char-pos13.png"