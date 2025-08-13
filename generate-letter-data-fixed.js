// Script to generate CORRECT letterImages data structure with direct key access

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const charCounts = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const letterImages = {
  "white": {}
};

// Generate structure for each letter
letters.forEach(letter => {
  letterImages.white[letter] = {};
  
  charCounts.forEach(count => {
    // For each character count, create direct keys for each position
    for (let pos = 1; pos <= count; pos++) {
      const key = `${count}-${pos}`; // e.g., "3-1", "3-2", "3-3"
      letterImages.white[letter][key] = `/images/letters/white/${letter}/${count}char-pos${pos}.png`;
    }
  });
});

console.log(JSON.stringify(letterImages, null, 2));