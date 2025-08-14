#!/bin/bash

# Download missing position files for each character count
# We need multiple position files for each character count

BASE_URL="https://res.cloudinary.com/drvnwq9bm/image/upload/w_915,f_auto/customizer-v2/colors"
COLOR="WL" # White Letters
STYLE="E" # Style identifier

# Letters A-Z
declare -a LETTERS=("A" "B" "C" "D" "E" "F" "G" "H" "I" "J" "K" "L" "M" "N" "O" "P" "Q" "R" "S" "T" "U" "V" "W" "X" "Y" "Z")

echo "Downloading missing position files for each character count..."

# For each letter
for LETTER in "${LETTERS[@]}"; do
    echo "Processing letter: $LETTER"
    
    # Create letter directory if it doesn't exist
    mkdir -p "public/images/letters/white/$LETTER"
    
    # For each character count (2-13)
    for CHAR_COUNT in {2..13}; do
        echo "  Character count: $CHAR_COUNT"
        
        # For each position in that character count
        for POSITION in $(seq 1 $CHAR_COUNT); do
            # Construct filename based on position
            FILENAME="public/images/letters/white/$LETTER/${CHAR_COUNT}char-pos${POSITION}.png"
            
            # Skip if file already exists
            if [[ -f "$FILENAME" ]]; then
                echo "    ✓ Already exists: ${CHAR_COUNT}char-pos${POSITION}.png"
                continue
            fi
            
            # Convert position to 2-digit format for URL (01, 02, 03, etc.)
            URL_POSITION=$(printf "%02d" $POSITION)
            
            # Construct the URL
            URL="$BASE_URL/$COLOR/$LETTER/$COLOR-$LETTER-$STYLE-$URL_POSITION.png"
            
            echo "    Downloading: ${CHAR_COUNT}char-pos${POSITION}.png from position $URL_POSITION"
            
            # Download the image
            if curl -f -s -o "$FILENAME" "$URL"; then
                echo "    ✓ Downloaded: $FILENAME"
            else
                echo "    ✗ Failed: $URL"
                # Remove empty file if download failed
                rm -f "$FILENAME"
            fi
            
            # Small delay to be respectful to the server
            sleep 0.05
        done
    done
    
    echo "  Completed letter: $LETTER"
done

echo ""
echo "Download complete!"
echo "Now we should have all position files for each character count."