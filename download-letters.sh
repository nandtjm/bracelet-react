#!/bin/bash

# Script to download all letter images from Cloudinary
# URL pattern: https://res.cloudinary.com/drvnwq9bm/image/upload/w_915,f_auto/customizer-v2/colors/WL/A/WL-A-E-01.png

# Create directories for organizing images
mkdir -p public/images/letters/white

# Base URL components
BASE_URL="https://res.cloudinary.com/drvnwq9bm/image/upload/w_915,f_auto/customizer-v2/colors"
COLOR="WL" # White Letters
STYLE="E" # Style identifier

# Colors array (you can add more colors later)
declare -a COLORS=("WL")

# Letters A-Z
declare -a LETTERS=("A" "B" "C" "D" "E" "F" "G" "H" "I" "J" "K" "L" "M" "N" "O" "P" "Q" "R" "S" "T" "U" "V" "W" "X" "Y" "Z")

# Positions 01-13 (for 2-13 character words)
declare -a POSITIONS=("01" "02" "03" "04" "05" "06" "07" "08" "09" "10" "11" "12" "13")

echo "Starting download of letter images..."
echo "This will download $(( ${#LETTERS[@]} * ${#POSITIONS[@]} )) images"

# Loop through each color
for COLOR_CODE in "${COLORS[@]}"; do
    echo "Processing color: $COLOR_CODE"
    
    # Determine folder name based on color code
    if [ "$COLOR_CODE" == "WL" ]; then
        FOLDER_NAME="white"
    else
        FOLDER_NAME=$(echo "$COLOR_CODE" | tr '[:upper:]' '[:lower:]')
    fi
    
    # Loop through each letter
    for LETTER in "${LETTERS[@]}"; do
        echo "  Downloading letter: $LETTER"
        
        # Create letter directory
        mkdir -p "public/images/letters/$FOLDER_NAME/$LETTER"
        
        # Loop through each position
        for POSITION in "${POSITIONS[@]}"; do
            # Construct the full URL
            URL="$BASE_URL/$COLOR_CODE/$LETTER/$COLOR_CODE-$LETTER-$STYLE-$POSITION.png"
            
            # Construct the local filename
            FILENAME="public/images/letters/$FOLDER_NAME/$LETTER/${#POSITIONS[@]}char-pos$((10#$POSITION)).png"
            
            # Check which character count this position represents (2-13 chars use positions 01-13)
            CHAR_COUNT=$((10#$POSITION + 1))  # Position 01 = 2 chars, 02 = 3 chars, etc.
            FILENAME="public/images/letters/$FOLDER_NAME/$LETTER/${CHAR_COUNT}char-pos$((10#$POSITION)).png"
            
            echo "    Position $POSITION -> $FILENAME"
            
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
done

echo "Download complete!"
echo "Images saved to: public/images/letters/"
echo ""
echo "Summary:"
echo "- Downloaded letters A-Z for white color"
echo "- Each letter has 13 position variants (for 2-13 character words)"
echo "- Images organized in: public/images/letters/white/[LETTER]/[CHARCOUNT]char-pos[POSITION].png"