#!/bin/bash

# Download remaining K-Z letters
BASE_URL="https://res.cloudinary.com/drvnwq9bm/image/upload/w_915,f_auto/customizer-v2/colors"
COLOR="WL"
STYLE="E"

declare -a LETTERS=("K" "L" "M" "N" "O" "P" "Q" "R" "S" "T" "U" "V" "W" "X" "Y" "Z")
declare -a POSITIONS=("01" "02" "03" "04" "05" "06" "07" "08" "09" "10" "11" "12" "13")

for LETTER in "${LETTERS[@]}"; do
    echo "Downloading letter: $LETTER"
    mkdir -p "public/images/letters/white/$LETTER"
    
    for i in "${!POSITIONS[@]}"; do
        POSITION=${POSITIONS[$i]}
        CHAR_COUNT=$((i + 2))
        URL="$BASE_URL/$COLOR/$LETTER/$COLOR-$LETTER-$STYLE-$POSITION.png"
        FILENAME="public/images/letters/white/$LETTER/${CHAR_COUNT}char-pos$((i + 1)).png"
        
        curl -f -s -o "$FILENAME" "$URL" && echo "✓ $LETTER-$POSITION" || rm -f "$FILENAME"
        sleep 0.05
    done
done

echo "Remaining letters download complete!"