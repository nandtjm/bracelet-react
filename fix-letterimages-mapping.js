// Fix letter images mapping based on actual downloaded files
const fs = require('fs');
const mockData = JSON.parse(fs.readFileSync('./src/data/mockData.json', 'utf8'));

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// The actual downloaded files follow this pattern:
// 2char-pos1.png, 3char-pos2.png, 4char-pos3.png, ..., 13char-pos12.png
// This seems to be: [X]char-pos[X-1].png

const newLetterImages = {
  "white": {}
};

letters.forEach(letter => {
  newLetterImages.white[letter] = {};
  
  // For 2-character words, we only have the first position 
  // Use 2char-pos1.png for both positions (temporary fix)
  newLetterImages.white[letter]["2-1"] = `/images/letters/white/${letter}/2char-pos1.png`;
  newLetterImages.white[letter]["2-2"] = `/images/letters/white/${letter}/2char-pos1.png`; // Duplicate for now
  
  // For 3-13 character words, map to the available files
  for (let charCount = 3; charCount <= 13; charCount++) {
    for (let pos = 1; pos <= charCount; pos++) {
      // Use the file that corresponds to this character count
      // All positions of same character count will use the same image (temporary)
      newLetterImages.white[letter][`${charCount}-${pos}`] = `/images/letters/white/${letter}/${charCount}char-pos${charCount - 1}.png`;
    }
  }
});

// Update mockData
mockData.letterImages = newLetterImages;

// Write back
fs.writeFileSync('./src/data/mockData.json', JSON.stringify(mockData, null, 2));

console.log('✓ Fixed letterImages mapping to match downloaded files');
console.log('✓ Note: Multiple positions use same image (temporary fix)');
console.log('✓ Each character count now maps to its corresponding downloaded file');