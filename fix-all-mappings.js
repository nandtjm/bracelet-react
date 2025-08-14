// Fix all character count mappings (2-13) to use correct position files
const fs = require('fs');
const mockData = JSON.parse(fs.readFileSync('./src/data/mockData.json', 'utf8'));

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// Fix all character count mappings (2-13)
letters.forEach(letter => {
  if (mockData.letterImages.white[letter]) {
    // For each character count
    for (let charCount = 2; charCount <= 13; charCount++) {
      // For each position in that character count
      for (let position = 1; position <= charCount; position++) {
        const key = `${charCount}-${position}`;
        const imagePath = `/images/letters/white/${letter}/${charCount}char-pos${position}.png`;
        mockData.letterImages.white[letter][key] = imagePath;
      }
    }
  }
});

// Write back the updated data
fs.writeFileSync('./src/data/mockData.json', JSON.stringify(mockData, null, 2));

console.log('✓ Fixed all character count mappings (2-13)');
console.log('✓ Each position now maps to its correct image file');

// Show examples
console.log('✓ Examples:');
console.log('  2-char word: "2-1" -> 2char-pos1.png, "2-2" -> 2char-pos2.png');
console.log('  3-char word: "3-1" -> 3char-pos1.png, "3-2" -> 3char-pos2.png, "3-3" -> 3char-pos3.png');
console.log('  5-char word: "5-1" -> 5char-pos1.png ... "5-5" -> 5char-pos5.png');