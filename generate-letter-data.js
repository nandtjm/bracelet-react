// Script to generate complete letterImages data structure for mockData.json

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const charCounts = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const letterImages = {
  "white": {}
};

// Generate structure for each letter
letters.forEach(letter => {
  letterImages.white[letter] = {};
  
  charCounts.forEach(count => {
    const positions = [];
    for (let pos = 1; pos <= count; pos++) {
      positions.push(`/images/letters/white/${letter}/${count}char-pos${pos}.png`);
    }
    letterImages.white[letter][`${count}char`] = positions;
  });
});

console.log(JSON.stringify(letterImages, null, 2));