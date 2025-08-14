// Fix 4-character position mapping
const fs = require('fs');
const mockData = JSON.parse(fs.readFileSync('./src/data/mockData.json', 'utf8'));

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// Fix 4-character mappings to use correct position files
letters.forEach(letter => {
  if (mockData.letterImages.white[letter]) {
    // For 4-character words, use correct position files
    mockData.letterImages.white[letter]["4-1"] = `/images/letters/white/${letter}/4char-pos1.png`;
    mockData.letterImages.white[letter]["4-2"] = `/images/letters/white/${letter}/4char-pos2.png`;
    mockData.letterImages.white[letter]["4-3"] = `/images/letters/white/${letter}/4char-pos3.png`;
    mockData.letterImages.white[letter]["4-4"] = `/images/letters/white/${letter}/4char-pos4.png`;
  }
});

// Write back the updated data
fs.writeFileSync('./src/data/mockData.json', JSON.stringify(mockData, null, 2));

console.log('✓ Fixed 4-character position mappings');
console.log('✓ Each position now maps to its correct image file');